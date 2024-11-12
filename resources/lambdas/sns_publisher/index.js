const AWS = require('aws-sdk');
const sns = new AWS.SNS();

exports.handler = async (event) => {
    const { topicArn, message } = event;

    if (!topicArn || !message) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Se requieren topicArn y message." })
        };
    }

    const subject = "Recordatorio de Evento"; // Puedes personalizar el asunto aquí

    try {
        // Publicar el mensaje en el tópico SNS con un asunto (subject) para los correos electrónicos
        await sns.publish({
            TopicArn: topicArn,
            Message: message,
            Subject: subject  // Este es el Subject que aparecerá en los correos electrónicos
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Mensaje enviado correctamente al tópico SNS." })
        };
    } catch (error) {
        console.error("Error al publicar el mensaje en SNS:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Error al publicar el mensaje: ${error.message}` })
        };
    }
};
