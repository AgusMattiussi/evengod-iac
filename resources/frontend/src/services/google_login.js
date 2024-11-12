import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { apiPost } from "./api";
import { useSharedAuth } from "./auth";
import { useNavigate } from "react-router-dom";

const CLIENT_ID =
    "102897822622-j0m36vpo56fqetqb0sbf2k9rtv6tp9m7.apps.googleusercontent.com";

const GoogleSignIn = () => {
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
        //console.log("Google Token Received:", response.credential);

        const googleToken = response.credential;
        const decodedToken = jwtDecode(googleToken);
        const { email } = decodedToken;

        try {
            const body = JSON.stringify({ googleToken, email })
            const response = await apiPost("/googleLogin", body);
        

            if (response.data) {
                console.log("User linked successfully");
                //console.log("Result: ", response);
                //console.log("Result body: ", response.data);

                localStorage.setItem(
                    "accessToken",
                    response.data.AccessToken || ""
                );
                localStorage.setItem(
                    "refreshToken",
                    response.data.RefreshToken || ""
                );
                localStorage.setItem("idToken", response.data.IdToken || "");
                localStorage.setItem(
                    "sub",
                    jwtDecode(response.data.AccessToken).sub || ""
                );
            
                await setAccessToken(response);
                navigate("/");

            } else {
                console.error("Error linking user");
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
