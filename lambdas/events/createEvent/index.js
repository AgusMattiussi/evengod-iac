const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
	host: process.env.RDS_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
};


const INSERT_EVENT_QUERY = "INSERT INTO events (title, category_id, description, user_id, start_date, end_date, inscriptions_start_date, inscriptions_end_date, virtual_room_link, modality, state, location ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";


// POST /events endpoint

//TODO: userId should be taken from the token
//TODO: Add validation for the dates
//TODO: default state?
//TODO: queryBuilder for non null fields

exports.handler = async (event) => {
	let connection;

	try {
		console.log(event);
		
		const to_insert = JSON.parse(event.body);
		const { 
			title,
			category_id,
			description,
			user_id,
			start_date,
			end_date,
			inscriptions_start_date,
			inscriptions_end_date, 
			virtual_room_link,
			modality,
			state,
			location 
		} = to_insert;

		// Validate input
		if (!title || !category_id || !description || !start_date || !end_date || !inscriptions_start_date || !inscriptions_end_date || !modality || !location) {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: "Missing required fields" }),
			};
		}


		// Connect to the database
		connection = await mysql.createConnection(dbConfig);

		// Insert the new event
		const [result] = await connection.execute(
			INSERT_EVENT_QUERY,
			[
				title,
				category_id,
				description,
				user_id,
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
				"Access-Control-Allow-Origin": "*", // Adjust this in production
				'Access-Control-Allow-Methods': '*',
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Expose-Headers': '*'
			},
			body: JSON.stringify({
				message: "Event created successfully",
				eventId: result.insertId, // TODO: Sera insertId?
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
