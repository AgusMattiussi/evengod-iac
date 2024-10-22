const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event, context) => {
  try {
    if (!event.requestContext || !event.requestContext.authorizer) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    // Check UUID of the user making the request
    // TODO: Change this for the cognito api gw
    const userUuid = event.requestContext.authorizer.claims.sub;
    const pathUserId =
      event.params && event.params.path && event.params.path.id;

    if (!userUuid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing UUID from Cognito",
        }),
      };
    }

    if (!pathUserId || pathUserId !== userUuid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "User ID does not match the authenticated user",
        }),
      };
    }

    // The username is the email address
    const userEmail =
      event.requestContext.authorizer.claims["cognito:username"];

    const { name, password, homeplace, profile_image_url, description } =
      JSON.parse(event.body);

    const userAttributes = [];
    if (name) userAttributes.push({ Name: "name", Value: name });
    if (homeplace)
      userAttributes.push({ Name: "custom:homeplace", Value: homeplace });
    if (profile_image_url)
      userAttributes.push({ Name: "picture", Value: profile_image_url });
    if (description)
      userAttributes.push({ Name: "custom:description", Value: description });

    if (userAttributes.length > 0) {
      await cognito
        .adminUpdateUserAttributes({
          UserPoolId: process.env.USER_POOL_ID,
          Username: userEmail,
          UserAttributes: userAttributes,
        })
        .promise();
    }

    if (password) {
      await cognito
        .adminSetUserPassword({
          UserPoolId: process.env.USER_POOL_ID,
          Username: userEmail,
          Password: password,
          Permanent: true,
        })
        .promise();
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "User updated successfully",
        username: userEmail,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error updating user",
        error: error.message,
      }),
    };
  }
};
