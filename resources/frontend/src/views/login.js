import React, { useState } from "react";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";
import { useSharedAuth } from "../services/auth";
import { HttpStatusCode } from "axios";
import { login } from "../services/cognito";
import { Loader } from "../components/loader";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { userInfo, setAccessToken } = useSharedAuth();

  const handleSignUpRedirect = () => {
    navigate("/signup");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response === HttpStatusCode.InternalServerError) {
        navigate("/500");
      } else if (response === HttpStatusCode.Ok) {
        console.log("Login successful");
        await setAccessToken(response);
        navigate("/");
      } else {
        // setEvent(response.data)
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-darker to-secondary">
        <div className="w-full max-w-md p-8 rounded shadow bg-blue-darker">
          <h2 className="text-2xl font-bold text-center mb-6">Inicia sesión</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                style={{ color: "black" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                style={{ color: "black" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-2 bg-blue-light text-white rounded-md hover:bg-blue transition-colors"
              >
                Ingresar
              </button>
            )}
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={handleSignUpRedirect}
              className="text-sm text-indigo-600 hover:text-blue-light"
            >
              ¿No tienes cuenta? Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
