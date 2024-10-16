const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

const s3 = new AWS.S3();

// Database configuration
const dbConfig = {
  host: process.env.RDS_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

exports.handler = async (event) => {
  let connection;
  try {
    const eventId = event.pathParameters && event.pathParameters.id;
    const { fileName, data } = JSON.parse(event.body);
    const bucketName = process.env.S3_BUCKET_NAME;

    // Upload file to S3
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: Buffer.from(data, 'base64'),
      ContentType: 'image/jpeg', // Adjust based on your file type
      ACL: 'public-read' // Allow read access to the file
    };

    const uploadResult = await s3.upload(params).promise();

    // Generate the URL for the uploaded file
    const imageUrl = uploadResult.Location;

    // Save URL to database
    connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'UPDATE events SET image_url = ? WHERE id = ?',
      [imageUrl, eventId]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Image uploaded and URL saved successfully', imageUrl })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing request', error: error.message })
    };
  }
};