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
      Filter: `sub = "${userId}"`, // UUID
    };

    const userResponse = await cognito.listUsers(params).promise();

    if (userResponse.Users.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    const cognitoUser = userResponse.Users[0];
    let userInfo = {
      email: cognitoUser.Attributes.find((attr) => attr.Name === "email").Value,
      name: cognitoUser.Attributes.find((attr) => attr.Name === "name").Value,
      homeplace:
        cognitoUser.Attributes.find((attr) => attr.Name === "custom:homeplace")
          ?.Value || "",
      profile_image_url:
        cognitoUser.Attributes.find((attr) => attr.Name === "picture")?.Value ||
        "",
      description:
        cognitoUser.Attributes.find(
          (attr) => attr.Name === "custom:description"
        )?.Value || "",
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(userInfo),
    };
  } catch (error) {
    console.error("Error retrieving user information:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error retrieving user information",
        error: error.message,
      }),
    };
  }
};
