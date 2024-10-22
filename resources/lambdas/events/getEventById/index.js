const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// GET /events/{eventId} endpoint
exports.handler = async (event, context) => {
  let connection;

  try {
    const eventId = event.pathParameters.id;

    if (!eventId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "eventId is required in the path",
        }),
      };
    }

    connection = await mysql.createConnection(dbConfig);

    const query = "SELECT * FROM events WHERE id = ?";
    const [rows] = await connection.execute(query, [eventId]);

    if (rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `Event with eventId ${eventId} not found`,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(rows[0]), // Return the first (and only) event
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching event",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
