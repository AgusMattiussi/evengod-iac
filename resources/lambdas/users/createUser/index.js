const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {

  try {
    console.log(event);
    const { username, email, password } = JSON.parse(event.body);

    // Validate input
    if (!username|| !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    const params = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: username },
      ],
      MessageAction: 'SUPPRESS',
    };

    const result = await cognito.adminCreateUser(params).promise();

    await cognito.adminSetUserPassword({
      UserPoolId: process.env.USER_POOL_ID,
      Username: email,
      Password: password,
      Permanent: true,
    }).promise();


    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust this in production
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Expose-Headers': '*'
      },
      body: JSON.stringify({
        message: 'User created successfully',
        userId: result.insertId,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating user', error: error.message }),
    };
  }
};
