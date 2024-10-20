const mysql = require("mysql2/promise");

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
exports.handler = async (event) => {
  let connection;

  try {
	const userUuid = event.requestContext.authorizer.claims.sub;
    
    if (!userUuid) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing UUID from Cognito",
            }),
        };
    }

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
      location 
    } = to_insert;

    if (!title || !category_id || !description || !start_date || !end_date || !inscriptions_start_date || !inscriptions_end_date || !modality || !location) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      INSERT_EVENT_QUERY,
      [
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
        location
      ]
    );

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Ajustar en producción
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Expose-Headers': '*'
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
