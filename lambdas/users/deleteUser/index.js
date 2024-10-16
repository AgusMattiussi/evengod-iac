const mysql = require('mysql2/promise');

// Configuración de la base de datos
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

    // Asumimos que el email se pasa en el cuerpo de la solicitud
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email is required' }),
      };
    }

    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);

    // Ejecutar la consulta para eliminar el usuario
    const [result] = await connection.execute(
      'DELETE FROM users WHERE email = ?',
      [email]
    );

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
        message: 'User eliminated successfully',
        email: email,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error deleting user', error: error.message }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};