const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
    host: process.env.RDS_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const INSERT_INSCRIPTION_QUERY = "INSERT INTO inscriptions (user_id, event_id, state) VALUES (?, ?, ?)";

// POST /inscriptions endpoint
exports.handler = async (event) => {
    let connection;

    try {
        console.log(event);

        const to_insert = JSON.parse(event.body);
        const { user_id, event_id, state } = to_insert;

        // Validate input
        if (!user_id || !event_id || !state) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing required fields" }),
            };
        }

        // Connect to the database
        connection = await mysql.createConnection(dbConfig);

        // Insert the new inscription
        const [result] = await connection.execute(
            INSERT_INSCRIPTION_QUERY,
            [user_id, event_id, state]
        );

        return {
            statusCode: 201,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Adjust this in production
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Expose-Headers': '*'
            },
            body: JSON.stringify({
                message: "Inscription created successfully",
                inscriptionId: result.insertId, // Will be insertId
            }),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error creating inscription",
                error: error.message,
            }),
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};
