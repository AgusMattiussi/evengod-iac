const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
    host: process.env.RDS_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// GET /inscriptions endpoint handler
exports.handler = async (event) => {
    let connection;
    try {
        // Obtener los query parameters desde el evento
        const userId = event.pathParameters && event.pathParameters.id;
        if(!userId) {
            return {
                statusCode: 400,
                body: {
                    message: "Missing required path parameter: id",
                },
            };
        }
        
        const query = "SELECT e.id, title, category_id, description, e.user_id, start_date, end_date, inscriptions_start_date, inscriptions_end_date, virtual_room_link, modality, e.state, location, image_url FROM inscriptions AS i JOIN events AS e ON i.event_id = e.id WHERE i.user_id = ?";
        const params = [userId];

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
            body: {
                message: "Error fetching inscriptions",
                error: JSON.stringify(error.message),
            },
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};
