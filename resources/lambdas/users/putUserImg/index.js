const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

const s3 = new AWS.S3();
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event, context) => {
  try {
    console.log("Event", event);

    const authorizationHeader =
      event.headers.Authorization || event.headers.authorization;

    if (!authorizationHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Authorization header missing" }),
      };
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid Authorization format" }),
      };
    }

    const decodedToken = jwt.decode(token);

    if (!decodedToken || !decodedToken.sub) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid token" }),
      };
    }

    const userUuid = decodedToken.sub;

    if (!userUuid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing UUID from Cognito",
        }),
      };
    }

    const pathUserId = event.pathParameters.id;

    if (!pathUserId || pathUserId !== userUuid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "User ID does not match the authenticated user",
        }),
      };
    }

    const eventBody = JSON.parse(event.body);
    console.log("Event body", eventBody);

    const data = eventBody.data || null;
    const bucketName = process.env.S3_BUCKET_NAME;

    if (!data && !eventBody.imageUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields: data OR imageUrl" }),
      };
    }

    let imageUrl;
    // Upload picture to S3 bucket
    if(!eventBody.imageUrl){
      const s3Params = {
        Bucket: bucketName,
        Key: pathUserId,
        Body: Buffer.from(data, "base64"),
        ContentType: "image/jpeg",
        ACL: "public-read",
      };

      const uploadResult = await s3.upload(s3Params).promise();
      imageUrl = uploadResult.Location;
    } else {
      imageUrl = eventBody.imageUrl;
    }

    console.log("imageUrl: ", imageUrl);


    // Update picture URL in Cognito
    const updateParams = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: pathUserId,
      UserAttributes: [
        {
          Name: "picture",
          Value: imageUrl,
        },
      ],
    };

    await cognito.adminUpdateUserAttributes(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Image uploaded and URL saved successfully",
        imageUrl,
      }),
    };
  } catch (error) {
    console.error("Error uploading image or updating Cognito:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing request",
        error: error.message,
      }),
    };
  }
};
