const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

// Database configuration
const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const INSERT_EVENT_QUERY = `
  INSERT INTO events 
  (title, category_id, description, user_uuid, start_date, end_date, inscriptions_start_date, inscriptions_end_date, virtual_room_link, modality, state, location) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// POST /events endpoint
exports.handler = async (event, context) => {
  let connection;

  try {
    console.log("Event", event);

    const authorizationHeader =
      event.headers.Authorization || event.headers.authorization;

    if (!authorizationHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Authorization header missing" }),
      };
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid Authorization format" }),
      };
    }

    const decodedToken = jwt.decode(token);

    if (!decodedToken || !decodedToken.sub) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid token" }),
      };
    }

    // Obtener el sub del token decodificado
    const userUuid = decodedToken.sub;

    // Parsear el cuerpo de la solicitud
    const to_insert = JSON.parse(event.body);

    const {
      title,
      category_id,
      description,
      start_date,
      end_date,
      inscriptions_start_date,
      inscriptions_end_date,
      virtual_room_link,
      modality,
      state,
      location,
    } = to_insert;

    if (
      !title ||
      !category_id ||
      !description ||
      !start_date ||
      !end_date ||
      !inscriptions_start_date ||
      !inscriptions_end_date ||
      !modality ||
      !location
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(INSERT_EVENT_QUERY, [
      title,
      category_id,
      description,
      userUuid, // UUID from request
      start_date,
      end_date,
      inscriptions_start_date,
      inscriptions_end_date,
      virtual_room_link,
      modality,
      state,
      location,
    ]);

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Ajustar en producción
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "*",
      },
      body: JSON.stringify({
        message: "Event created successfully",
        eventId: result.insertId,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating event",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
