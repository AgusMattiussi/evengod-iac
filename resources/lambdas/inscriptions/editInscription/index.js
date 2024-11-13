const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// POST /inscriptions/{id} endpoint
exports.handler = async (event, context) => {
  let connection;

  try {
    const inscriptionId = event.pathParameters.id;

    if (!inscriptionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "id is required in the path",
        }),
      };
    }

    const body = JSON.parse(event.body);
    const { state } = body;

    // Validar que se haya proporcionado el nuevo estado
    if (!state) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "state is required in the body",
        }),
      };
    }

    // let notificationArn = null;

    // if (state === "Cancelled") {
    //   const [rows] = await connection.execute(
    //     "SELECT notification_arn FROM inscriptions WHERE id = ?",
    //     [inscriptionId]
    //   );

    //   if (rows.length === 0) {
    //     return {
    //       statusCode: 404,
    //       body: JSON.stringify({
    //         message: `Inscription with id ${inscriptionId} not found`,
    //       }),
    //     };
    //   }

    //   sns.unsubscribe({ SubscriptionArn: rows[0].notification_arn }).promise();
    // } else {
    //   const [rows] = await connection.execute(
    //     "SELECT event_id FROM inscriptions WHERE id = ?",
    //     [inscriptionId]
    //   );

    //   if (rows.length === 0) {
    //     return {
    //       statusCode: 404,
    //       body: JSON.stringify({
    //         message: `Inscription with id ${inscriptionId} not found`,
    //       }),
    //     };
    //   }

    //   const [eventRows] = await connection.execute(
    //     "SELECT topic_arn FROM events WHERE id = ?",
    //     [rows[0].event_id]
    //   );

    //   if (eventRows.length === 0) {
    //     return {
    //       statusCode: 404,
    //       body: JSON.stringify({
    //         message: `Event with id ${rows[0].event_id} not found`,
    //       }),
    //     };
    //   }

    //   const topicArn = eventRows[0].topic_arn;

    //   const { SubscriptionArn } = await sns
    //     .subscribe({
    //       Protocol: "email",
    //       TopicArn: topicArn,
    //       Endpoint: decodedToken.email,
    //     })
    //     .promise();
      
    //   notificationArn = SubscriptionArn;
    // }

    connection = await mysql.createConnection(dbConfig);

    const query =
      "UPDATE inscriptions SET state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    const [result] = await connection.execute(query, [state, inscriptionId]);

    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `Inscription with id ${inscriptionId} not found`,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Adjust this in production
      },
      body: JSON.stringify({
        message: "Inscription updated successfully",
      }),
    };
  } catch (error) {
    console.error("Error updating inscription:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error updating inscription",
        error: error.message,
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
