const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const GET_CATEGORY_BY_ID_QUERY = "SELECT id, name FROM categories WHERE id = ?";

exports.handler = async (event, context) => {
  let connection;

  try {
    const categoryId = event.pathParameters.id;

    if (!categoryId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "categoryId is required in the path" }),
      };
    }

    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(GET_CATEGORY_BY_ID_QUERY, [
      categoryId,
    ]);

    if (rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `Category with id ${categoryId} not found`,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(rows[0]), // Return the first (and only) category
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching category",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
