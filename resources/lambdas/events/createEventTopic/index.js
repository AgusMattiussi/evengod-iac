const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const sns = new AWS.SNS();
const eventbridge = new AWS.EventBridge();
const lambda = new AWS.Lambda();

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

    // Parsear el cuerpo de la solicitud
    const body = JSON.parse(event.body);

    console.log(body);

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
    } = body;

    // Obtener el sub del token decodificado
    const userUuid = decodedToken.sub;
    const topicUuid = uuidv4();

    console.log("creating sns topic")

    const createTopicResponse = await sns.createTopic({ Name: "event_" + topicUuid + "_notifications" }).promise();

    console.log("finish creating topic")

    const topicArn = createTopicResponse.TopicArn

    console.log("defining cron variables")

    // Calcular la fecha un día antes de la fecha objetivo
    const targetDateTime = new Date(start_date);
    const notificationDate = new Date(targetDateTime);
    // notificationDate.setDate(targetDateTime.getDate() - 1);
    // TODO: Check if this is minus 5 mins or set to 5 mins
    notificationDate.setMinutes(targetDateTime.getMinutes() - 5);

    // Formato de la fecha en cron (hora UTC, aquí 9:00 AM)
    // const cronExpression = `cron(${notificationDate.getUTCMinutes()} ${notificationDate.getUTCHours()} ${notificationDate.getUTCDate()} ${notificationDate.getUTCMonth() + 1} ? ${notificationDate.getUTCFullYear()})`;
    const cronExpression = `cron(${notificationDate.getMinutes()} ${notificationDate.getHours()} ${notificationDate.getDate()} ${notificationDate.getMonth() + 1} ? ${notificationDate.getFullYear()})`;

    console.log("creating eventbridge rule")

    // Crear la regla en EventBridge
    const ruleName = `event-${topicUuid}-publish-rule`;
    await eventbridge.putRule({
        Name: ruleName,
        ScheduleExpression: cronExpression,
        State: "ENABLED",
        Description: `Regla para publicar en SNS el inicio del evento ${title}`
    }).promise();

    console.log("configuring eventbridge rule")

    // Configurar el target para que invoque a la misma Lambda con el mensaje
    await eventbridge.putTargets({
        Rule: ruleName,
        Targets: [
            {
                Id: "event_" + topicUuid,
                Arn: process.env.LAMBDA_SNS_PUBLISHER,  // Nombre de esta Lambda
                Input: JSON.stringify({
                    topicArn: topicArn,
                    message: `El evento ${title} comienza mañana. A continuación los detalles del mismo:\n
                    - Nombre: ${title}\n
                    - Descripción: ${description}\n
                    - Fecha de inicio: ${start_date}\n
                    - Fecha de fin: ${end_date}\n
                    - Lugar: ${location}\n
                    - Modalidad: ${modality}`
                })
            }
        ]
    }).promise();

    const createLambdaResponse = await lambda.invoke({
        FunctionName: "createEvent",
        InvocationType: "RequestResponse",
        Payload: JSON.stringify({
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
        }),
    }).promise()

    response = JSON.parse(createLambdaResponse.Payload)

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Ajustar en producción
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "*",
      },
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