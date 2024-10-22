const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event, context) => {
  try {
    const userId = event.pathParameters.id;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "User ID is required in the path",
        }),
      };
    }

    const params = {
      UserPoolId: process.env.USER_POOL_ID,
      Filter: `sub = "${userId}"`,
    };

    const userResponse = await cognito.listUsers(params).promise();

    if (userResponse.Users.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    const cognitoUser = userResponse.Users[0];
    const imageUrl =
      cognitoUser.Attributes.find((attr) => attr.Name === "picture")?.Value ||
      "";

    if (imageUrl) {
      return {
        statusCode: 200,
        body: JSON.stringify({ imageUrl }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Image URL not found for the user" }),
      };
    }
  } catch (error) {
    console.error("Error retrieving user image URL:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error retrieving user information",
        error: error.message,
      }),
    };
  }
};
