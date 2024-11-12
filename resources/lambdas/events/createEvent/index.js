const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
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
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const GET_CATEGORY_NAME_BY_ID_QUERY = "SELECT name FROM categories WHERE id = ?";

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

    const createTopicResponse = await sns.createTopic({ name: "event_"+result.insertId+"_notifications" }).promise();
    const topicArn = createTopicResponse.TopicArn

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
      topicArn
    ]);

    const [rows] = await connection.execute(GET_CATEGORY_NAME_BY_ID_QUERY, [
      category_id
    ]) 

    // Calcular la fecha un día antes de la fecha objetivo
    const targetDateTime = new Date(start_date);
    const notificationDate = new Date(targetDateTime);
    // notificationDate.setDate(targetDateTime.getDate() - 1);
    notificationDate.setMinutes(targetDateTime.getMinutes() - 5);

    // Formato de la fecha en cron (hora UTC, aquí 9:00 AM)
    // const cronExpression = `cron(${notificationDate.getUTCMinutes()} ${notificationDate.getUTCHours()} ${notificationDate.getUTCDate()} ${notificationDate.getUTCMonth() + 1} ? ${notificationDate.getUTCFullYear()})`;
    const cronExpression = `cron(${notificationDate.getUTCMinutes()} ${notificationDate.getUTCHours()} ${notificationDate.getUTCDate()} ${notificationDate.getUTCMonth() + 1} ? ${notificationDate.getUTCFullYear()})`;

    // Crear la regla en EventBridge
    const ruleName = `${topicName}-publish-rule`;
    await eventbridge.putRule({
        Name: ruleName,
        ScheduleExpression: cronExpression,
        State: "ENABLED",
        Description: `Regla para publicar en SNS el inicio del evento ${title}`
    }).promise();

    // Configurar el target para que invoque a la misma Lambda con el mensaje
    await eventbridge.putTargets({
        Rule: ruleName,
        Targets: [
            {
                Id: "1",
                Arn: process.env.AWS_LAMBDA_FUNCTION_NAME,  // Nombre de esta Lambda
                Input: JSON.stringify({
                    topicArn: topicArn,
                    message: `El evento ${title} comienza mañana. A continuación los detalles del mismo:\n
                    - Nombre: ${title}\n
                    - Categoría: ${rows[0].name}\n
                    - Descripción: ${description}\n
                    - Fecha de inicio: ${start_date}\n
                    - Fecha de fin: ${end_date}\n
                    - Lugar: ${location}\n
                    - Modalidad: ${modality}`
                })
            }
        ]
    }).promise();

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
