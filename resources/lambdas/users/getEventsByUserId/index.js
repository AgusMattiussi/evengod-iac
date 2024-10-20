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
        // UUID of the user making the request
        const userUuid = event.requestContext.authorizer.claims.sub;
        
        if (!userUuid) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Missing UUID from Cognito",
                }),
            };
        }
        
        const query = `SELECT e.id, title, category_id, description, e.user_uuid, 
                        start_date, end_date, inscriptions_start_date, 
                        inscriptions_end_date, virtual_room_link, modality, 
                        e.state, location, image_url 
                    FROM inscriptions AS i 
                    JOIN events AS e ON i.event_id = e.id 
                    WHERE i.user_uuid = ?`;
                    
        const params = [userUuid];

        connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(query, params);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(rows),
        };
    } catch (error) {
        console.error("Error fetching inscriptions:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error fetching inscriptions",
                error: JSON.stringify(error.message),
            }),
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};
