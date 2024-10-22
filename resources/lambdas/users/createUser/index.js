const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
});

const cognito = new AWS.CognitoIdentityServiceProvider();

const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

const poolData = {
  UserPoolId: process.env.USER_POOL_ID,
  ClientId: process.env.CLIENT_ID,
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

exports.handler = async (event) => {
  try {
    console.log("Received event:", event);
    const { username, email, password } = JSON.parse(event.body);

    if (!username || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const attributeList = [
      new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: "email",
        Value: email,
      }),
      new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: "name",
        Value: username,
      }),
    ];

    const result = await signUpUser(email, password, attributeList);

    await cognito
      .adminConfirmSignUp({
        UserPoolId: poolData.UserPoolId,
        Username: email,
      })
      .promise();

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Adjust this in production
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "*",
      },
      body: JSON.stringify({
        message: "User created successfully",
        userId: result.userSub, // Cognito returns the userSub as the user ID
      }),
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating user",
        error: error.message,
      }),
    };
  }
};

// Helper function to handle sign-up process as a promise
function signUpUser(email, password, attributeList) {
  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
