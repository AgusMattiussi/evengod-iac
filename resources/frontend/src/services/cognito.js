import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// const USER_POOL_ID = "us-east-1_123456789";

const CLIENT_ID = "12345678901234567890";

const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

export const signUp = async (email, password, name) => {
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
    ],
  };
  try {
    const command = new SignUpCommand(params);
    const response = await cognitoClient.send(command);
    console.log("Sign up success: ", response);
    return response;
  } catch (error) {
    console.error("Error signing up: ", error);
    throw error;
  }
};

export const confirmSignUp = async (email, code) => {
  const params = {
    ClientId: CLIENT_ID,
    ConfirmationCode: code,
    Username: email,
  };
  try {
    const command = new ConfirmSignUpCommand(params);
    const response = await cognitoClient.send(command);
    console.log("Confirm sign up success: ", response);
    return response;
  } catch (error) {
    console.error("Error confirming sign up: ", error);
    throw error;
  }
};

export const login = async (email, password) => {
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };
  try {
    const command = new InitiateAuthCommand(params);
    const { AuthenticationResult } = await cognitoClient.send(command);

    if (AuthenticationResult) {
      localStorage.setItem("idToken", AuthenticationResult.IdToken || "");
      localStorage.setItem(
        "accessToken",
        AuthenticationResult.AccessToken || ""
      );
      localStorage.setItem(
        "refreshToken",
        AuthenticationResult.RefreshToken || ""
      );
      return AuthenticationResult;
    }
  } catch (error) {
    console.error("Error logging in: ", error);
    throw error;
  }
};
