const AWS = require("aws-sdk");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const DELETE_QUERY = "DELETE FROM events WHERE id = ?";

// DELETE /events/{eventId} endpoint
exports.handler = async (event, context) => {
  let connection;

  try {
    const eventId = event.pathParameters.id;

    if (!eventId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "eventId is required in the path" }),
      };
    }

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

    // ID of the user making the request
    const userUuid = decodedToken.sub;

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
          message: "You are not authorized to delete this event",
        }),
      };
    }

    await connection.execute(DELETE_QUERY, [eventId]);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Event with eventId ${eventId} deleted successfully`,
      }),
    };
  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error deleting event",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
