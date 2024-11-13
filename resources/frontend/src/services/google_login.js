import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { apiPost, apiPut } from "./api";
import { useSharedAuth } from "./auth";
import { useNavigate } from "react-router-dom";

const CLIENT_ID =
  "102897822622-j0m36vpo56fqetqb0sbf2k9rtv6tp9m7.apps.googleusercontent.com";

const GoogleSignIn = ({ setLoader }) => {
  const { setAccessToken } = useSharedAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large" }
      );
    }
  };

  const handleCredentialResponse = async (response) => {
    setLoader(true);
    const googleToken = response.credential;
    const decodedToken = jwtDecode(googleToken);
    const { email } = decodedToken;

    try {
      const body = JSON.stringify({ googleToken, email });
      const response = await apiPost("/googleLogin", body);
      const sub = jwtDecode(response.data.AccessToken).sub;

      if (response.data) {
        console.log("User linked successfully");
        console.log("Setting tokens in local storage");

        localStorage.setItem("accessToken", response.data.AccessToken || "");
        localStorage.setItem("refreshToken", response.data.RefreshToken || "");
        localStorage.setItem("idToken", response.data.IdToken || "");
        localStorage.setItem("sub", sub || "");

        if(response.data.isNewUser) {
            await apiPut(`/users/${sub}/image`, JSON.stringify({ "imageUrl": decodedToken.picture }));
            console.log("Image uploaded successfully");
        }

        await setAccessToken(response);

        navigate("/");
      } else {
        console.error("Error linking user");
      }
    } catch (error) {
      console.error("Error linking Google user:", error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div>
      <div id="google-signin-button"></div>
    </div>
  );
};

export default GoogleSignIn;
