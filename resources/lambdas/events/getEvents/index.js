const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Query builder para búsqueda de eventos
const buildEventQuery = (queryParams) => {
  let query = "SELECT * FROM events WHERE 1=1";
  let params = [];

  if (queryParams.modality) {
    query += " AND modality = ?";
    params.push(queryParams.modality);
  }

  if (queryParams.start_date) {
    query += " AND start_date >= ?";
    params.push(queryParams.start_date);
  }

  if (queryParams.end_date) {
    query += " AND end_date <= ?";
    params.push(queryParams.end_date);
  }

  if (queryParams.state) {
    query += " AND state = ?";
    params.push(queryParams.state);
  }

  if (queryParams.location) {
    query += " AND location LIKE ?";
    params.push(`%${queryParams.location}%`);
  }

  if (queryParams.category_id) {
    query += " AND category_id LIKE ?";
    params.push(`%${queryParams.category_id}%`);
  }

  return { query, params };
};

// GET /events endpoint handler
exports.handler = async (event, context) => {
  let connection;
  try {
    // Obtener los query parameters desde el evento
    const queryParams = event.queryStringParameters || {};

    // Construir la consulta de búsqueda
    const { query, params } = buildEventQuery(queryParams);

    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);

    // Ejecutar la consulta
    const [rows] = await connection.execute(query, params);

    // Retornar los resultados
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(rows),
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching events",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
