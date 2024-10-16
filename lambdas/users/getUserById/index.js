const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

exports.handler = async (event) => {
  let connection;
  try {
    console.log(event);

    const userId = event.pathParameters && event.pathParameters.id;

        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "id is required in the path",
                }),
            };
        }

    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // Query to get user information
    const [rows] = await connection.execute(
      'SELECT id, username, email, description, homeplace, profile_image_url, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(rows[0]),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error retrieving user information', error: error.message }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};