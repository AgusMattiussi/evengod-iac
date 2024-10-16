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
    const userId = event.pathParameters && event.pathParameters.id;

    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT profile_image_url FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length > 0 && rows[0].profile_image_url) {
      return {
        statusCode: 200,
        body: JSON.stringify({ imageUrl: rows[0].profile_image_url })
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Image URL not found for the user' })
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error retrieving URL from database', error: error.message })
    };
  }
};