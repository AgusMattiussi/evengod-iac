const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

exports.handler = async (event, context) => {
  let connection;
  try {
    const eventId = event.pathParameters.id;

    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT image_url FROM events WHERE id = ?",
      [eventId]
    );

    if (rows.length > 0 && rows[0].image_url) {
      return {
        statusCode: 200,
        body: JSON.stringify({ imageUrl: rows[0].image_url }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Image URL not found for the user" }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error retrieving URL from database",
        error: error.message,
      }),
    };
  }
};
