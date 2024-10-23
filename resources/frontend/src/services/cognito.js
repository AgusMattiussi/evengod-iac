import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { jwtDecode } from "jwt-decode";
import { HttpStatusCode } from "axios";

const CLIENT_ID = "62lsf06fjnq58ep6g9qes240mt";

const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

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
      localStorage.setItem(
        "accessToken",
        AuthenticationResult.AccessToken || ""
      );
      localStorage.setItem(
        "refreshToken",
        AuthenticationResult.RefreshToken || ""
      );
      localStorage.setItem("idToken", AuthenticationResult.IdToken || "");
      localStorage.setItem(
        "sub",
        jwtDecode(AuthenticationResult.AccessToken).sub || ""
      );
      return HttpStatusCode.Ok;
    }
  } catch (error) {
    console.error("Error logging in: ", error);
    return HttpStatusCode.InternalServerError;
  }
};
