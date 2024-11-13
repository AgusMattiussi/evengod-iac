const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const sns = new AWS.SNS();
const eventbridge = new AWS.EventBridge();

// Database configuration
const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const INSERT_EVENT_QUERY = `
  INSERT INTO events 
  (title, category_id, description, user_uuid, start_date, end_date, inscriptions_start_date, inscriptions_end_date, virtual_room_link, modality, state, location, topic_arn) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// POST /events endpoint
exports.handler = async (body) => {
  let connection;

  try {
    console.log("Event", body);

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
      topicArn,
      userUuid,
    } = body;

    if (
      !title ||
      !category_id ||
      !description ||
      !start_date ||
      !end_date ||
      !inscriptions_start_date ||
      !inscriptions_end_date ||
      !modality ||
      !location ||
      !topicArn ||
      !userUuid
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    connection = await mysql.createConnection(dbConfig);

    console.log("inserting register to sql table")

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
      topicArn
    ]);

    console.log("returning afer successful execution")

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
