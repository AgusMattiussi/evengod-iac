const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    try {
        const { googleToken, email } = JSON.parse(event.body);
        
        if (!googleToken || !email) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
                body: JSON.stringify({ 
                    error: 'Missing required fields' 
                })
            };
        }

        const decodedToken = jwt.decode(googleToken);
        console.log('Decoded token:', decodedToken);

        // Check if user exists in Cognito
        console.log('Checking if user exists...');
        const existingUser = await findUserByEmail(email);
        console.log('Existing user?:', existingUser);
        
        if (existingUser) {
            // Link signin with existing user
            const session = await adminSetUserPassword(existingUser.Username);
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
                body: JSON.stringify({
                    message: 'User authenticated successfully',
                    ...session,
                    isNewUser: false
                })
            };
        }
        
        // Create new user if doesn't exist
        console.log('Creating new user...');
        const newUser = await createCognitoUser(email, decodedToken.name);
        console.log('New user:', newUser);
        console.log('Setting password...');
        const session = await adminSetUserPassword(newUser.Username);
        console.log('Session:', session);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                message: 'User created and authenticated successfully',
                ...session,
                isNewUser: true
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message
            })
        };
    }
};

async function findUserByEmail(email) {
    try {
        const params = {
            UserPoolId: process.env.USER_POOL_ID,
            Filter: `email = "${email}"`
        };
        
        const response = await cognito.listUsers(params).promise();
        return response.Users?.[0];
    } catch (error) {
        console.error('Error finding user:', error);
        return null;
    }
}


async function createCognitoUser(email, name) {
    const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: email,
        UserAttributes: [
            {
                Name: 'email',
                Value: email
            },
            {
                Name: 'email_verified',
                Value: 'true'
            },
            {
                Name: 'name',
                Value: name
            }
        ],
        MessageAction: 'SUPPRESS'
    };

    const response = await cognito.adminCreateUser(params).promise();
    return response.User;
}

async function adminSetUserPassword(username) {
    // Generate a secure random password
    const password = Math.random().toString(36).slice(-8) + 
                    Math.random().toString(36).slice(-8).toUpperCase() + 
                    Math.random().toString(9).slice(-4) + 
                    '#@';

    // Set the password for the user
    await cognito.adminSetUserPassword({
        UserPoolId: process.env.USER_POOL_ID,
        Username: username,
        Password: password,
        Permanent: true
    }).promise();

    // Get session tokens
    const authParams = {
        UserPoolId: process.env.USER_POOL_ID,
        ClientId: process.env.CLIENT_ID,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password
        }
    };

    const authResponse = await cognito.adminInitiateAuth(authParams).promise();
    return authResponse.AuthenticationResult;
}