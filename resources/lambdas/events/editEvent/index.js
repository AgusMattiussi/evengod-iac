const AWS = require("aws-sdk");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

class EditEvent {
  constructor(data) {
    this.fields = data;
  }

  buildUpdateQuery(eventId) {
    const allowedFields = [
      "title",
      "category_id",
      "description",
      "start_date",
      "end_date",
      "inscriptions_start_date",
      "inscriptions_end_date",
      "virtual_room_link",
      "modality",
      "state",
      "location",
    ];

    let query = "UPDATE events SET";
    let params = [];

    Object.keys(this.fields).forEach((field, index) => {
      if (allowedFields.includes(field) && this.fields[field] !== undefined) {
        if (index > 0) query += ",";
        query += ` ${field} = ?`;
        params.push(this.fields[field]);
      }
    });

    if (params.length === 0) {
      throw new Error("No fields provided for update");
    }

    query += " WHERE id = ?";
    params.push(eventId);

    return { query, params };
  }
}

// POST /events/{eventId} endpoint
exports.handler = async (event, context) => {
  let connection;

  try {
    const eventId = event.pathParameters.id;

    if (!eventId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "eventId is required in the path" }),
      };
    }

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

    // ID of the user making the request
    const userUuid = decodedToken.sub;

    connection = await mysql.createConnection(dbConfig);

    // Check if user is event creator
    const [eventResult] = await connection.execute(
      "SELECT user_uuid FROM events WHERE id = ?",
      [eventId]
    );

    if (eventResult.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `Event with eventId ${eventId} not found`,
        }),
      };
    }

    const eventUserUuid = eventResult[0].user_uuid;

    if (eventUserUuid !== userUuid) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "You are not authorized to edit this event",
        }),
      };
    }

    const editEvent = new EditEvent(JSON.parse(event.body));

    const { query, params } = editEvent.buildUpdateQuery(eventId);

    const [result] = await connection.execute(query, params);

    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `No changes made to event with eventId ${eventId}`,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Event with eventId ${eventId} updated successfully`,
      }),
    };
  } catch (error) {
    console.error("Error updating event:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error updating event",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
