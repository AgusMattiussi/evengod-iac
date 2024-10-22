const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Query builder para búsqueda de inscripciones
const buildInscriptionQuery = (queryParams) => {
  let query = "SELECT * FROM inscriptions WHERE 1=1";
  let params = [];

  if (queryParams.user_id) {
    query += " AND user_id = ?";
    params.push(queryParams.user_id);
  }

  if (queryParams.event_id) {
    query += " AND event_id = ?";
    params.push(queryParams.event_id);
  }

  if (queryParams.state) {
    query += " AND state = ?";
    params.push(queryParams.state);
  }

  return { query, params };
};

// GET /inscriptions endpoint handler
exports.handler = async (event, context) => {
  let connection;
  try {
    console.log("Event", event);
    // Obtener los query parameters desde el evento
    const queryParams = event.queryStringParameters || {};

    // Construir la consulta de búsqueda
    const { query, params } = buildInscriptionQuery(queryParams);

    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);

    // Ejecutar la consulta
    const [rows] = await connection.execute(query, params);

    // Retornar los resultados
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Adjust this in production
      },
      body: JSON.stringify(rows),
    };
  } catch (error) {
    console.error("Error fetching inscriptions:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching inscriptions",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
