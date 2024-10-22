const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// GET /inscriptions/{id} endpoint
exports.handler = async (event, context) => {
  let connection;

  try {
    const inscriptionId = event.pathParameters.id;

    if (!inscriptionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "id is required in the path",
        }),
      };
    }

    connection = await mysql.createConnection(dbConfig);

    const query = "SELECT * FROM inscriptions WHERE id = ?";
    const [rows] = await connection.execute(query, [inscriptionId]);

    if (rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `Inscription with id ${inscriptionId} not found`,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Adjust this in production
      },
      body: JSON.stringify(rows[0]), // Return the first (and only) inscription
    };
  } catch (error) {
    console.error("Error fetching inscription:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching inscription",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
