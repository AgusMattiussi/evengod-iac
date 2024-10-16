const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

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

    const { email, username, password, description, homeplace, profile_image_url } = JSON.parse(event.body);

    // Validate input
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email is required' }),
      };
    }

    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // Start building the update query
    let updateQuery = 'UPDATE users SET';
    const updateValues = [];
    const updateFields = [];

    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (homeplace !== undefined) {
      updateFields.push('homeplace = ?');
      updateValues.push(homeplace);
    }
    if (profile_image_url !== undefined) {
      updateFields.push('profile_image_url = ?');
      updateValues.push(profile_image_url);
    }

    if (updateFields.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No fields to update' }),
      };
    }

    updateQuery += ' ' + updateFields.join(', ') + ' WHERE email = ?';
    updateValues.push(email);

    // Execute the update query
    const [result] = await connection.execute(updateQuery, updateValues);

    if (result.affectedRows === 0) {
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
      body: JSON.stringify({
        message: 'User updated successfully',
        email: email,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating user', error: error.message }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};