const AWS = require("aws-sdk");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

const s3 = new AWS.S3();

const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

exports.handler = async (event, context) => {
  let connection;
  try {
    console.log("Event", event);

    const authorizationHeader =
      event.headers.Authorization || event.headers.authorization;

    if (!authorizationHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Authorization header missing" }),
      };
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid Authorization format" }),
      };
    }

    const decodedToken = jwt.decode(token);

    if (!decodedToken || !decodedToken.sub) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid token" }),
      };
    }

    const userUuid = decodedToken.sub;

    const eventId = event.pathParameters.id;

    if (!eventId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "eventId is required in the path" }),
      };
    }

    connection = await mysql.createConnection(dbConfig);

    // Check if user is event creator
    const [eventResult] = await connection.execute(
      "SELECT user_uuid FROM events WHERE id = ?",
      [eventId]
    );

    if (eventResult.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `Event with eventId ${eventId} not found`,
        }),
      };
    }

    const eventUserUuid = eventResult[0].user_uuid;

    if (eventUserUuid !== userUuid) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "You are not authorized to edit this event",
        }),
      };
    }

    const { data } = JSON.parse(event.body);
    const bucketName = process.env.S3_BUCKET_NAME;

    const params = {
      Bucket: bucketName,
      Key: `event-${eventId}`,
      Body: Buffer.from(data, "base64"),
      ContentType: "image/jpeg", // Ajustar según el tipo de archivo
      ACL: "public-read", // Permitir acceso de lectura al archivo
    };

    const uploadResult = await s3.upload(params).promise();

    const imageUrl = uploadResult.Location;

    await connection.execute("UPDATE events SET image_url = ? WHERE id = ?", [
      imageUrl,
      eventId,
    ]);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Image uploaded and URL saved successfully",
        imageUrl,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing request",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
