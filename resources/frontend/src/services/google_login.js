import React, { useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

const CLIENT_ID = "102897822622-j0m36vpo56fqetqb0sbf2k9rtv6tp9m7.apps.googleusercontent.com";

const GoogleSignIn = () => {
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
    console.log("Google Token Received:", response.credential);
  
    const googleToken = response.credential;
    const decodedToken = jwtDecode(googleToken);
    const { email } = decodedToken;
  
    try {
      const result = await fetch("https://vlf2ioj8o1.execute-api.us-east-1.amazonaws.com/prod/googleLogin", {
        method: "POST",
        body: JSON.stringify({ googleToken, email }),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (result.ok) {
        console.log("User linked successfully");
      } else {
        console.error("Error linking user", await result.json());
      }
    } catch (error) {
      console.error("Error linking Google user:", error);
    }
  };
  

  return (
    <div>
      <div id="google-signin-button"></div>
    </div>
  );
};

export default GoogleSignIn;
