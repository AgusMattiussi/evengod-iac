const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

const sns = new AWS.SNS();

// Database configuration
const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const INSERT_INSCRIPTION_QUERY =
  "INSERT INTO inscriptions (user_uuid, event_id, state, notification_arn) VALUES (?, ?, ?, ?)";

const GET_EVENT_TOPIC_ARN = "SELECT topic_arn FROM events WHERE id = ?";

// POST /inscriptions endpoint
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

    const to_insert = JSON.parse(event.body);
    const { event_id, state } = to_insert;

    // Validate input
    if (!event_id || !state) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(GET_EVENT_TOPIC_ARN, [event_id]);
    const topicArn = rows[0].topic_arn;

    const { SubscriptionArn } = await sns.subscribe({
      Protocol: "email",
      TopicArn: topicArn,
      Endpoint: decodedToken.email,
    }).promise();

    const [result] = await connection.execute(INSERT_INSCRIPTION_QUERY, [
      userUuid,
      event_id,
      state,
      SubscriptionArn,
    ]);

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Adjust this in production
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "*",
      },
      body: JSON.stringify({
        message: "Inscription created successfully",
        inscriptionId: result.insertId, // Will be insertId
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating inscription",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
