const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// TODO: Page, pageSize, sort
const GET_CATEGORIES_QUERY = "SELECT id, name FROM categories";

exports.handler = async (event, context) => {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(GET_CATEGORIES_QUERY);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(rows),
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching categories",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
