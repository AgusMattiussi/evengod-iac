import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPut } from "../services/api";
import { Loader } from "../components/loader";
import { HttpStatusCode } from "axios";
import { useSharedAuth } from "../services/auth";

const EditUserForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const { setUserInfo, getSub } = useSharedAuth();

  const [userName, setUserName] = useState("");
  const [description, setDescription] = useState("");
  const [homeplace, setHomeplace] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiGet(`/users/${getSub()}`);
      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500");
      } else if (response.status === HttpStatusCode.NoContent) {
        setUser({});
      } else {
        setUser(response.data);
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) {
      fetchUser();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name: userName,
        description: description,
        homeplace: homeplace,
      };
      const id = getSub();
      const response = await apiPut(`/users/${id}`, data);
      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500");
      }
      if (imageBase64 !== "") {
        const imageData = {
          data: imageBase64,
        };
        await apiPut(`/users/${id}/image`, imageData);
      }
      fetchUser();
      navigate(`/profile/${id}`);
    } catch (error) {
      console.error("Error during updating the user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result.split(",")[1]); // Sacamos 'data:image/...;base64,'
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-darker to-secondary">
        <div className="w-full max-w-md p-8 bg-blue-darker rounded shadow">
          <h2 className="text-2xl font-bold text-center mb-6">Editar perfil</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre de usuario
              </label>
              <input
                id="title"
                onChange={(e) => setUserName(e.target.value)}
                style={{ color: "black" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={user.name}
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-white"
              >
                Descripción
              </label>
              <textarea
                id="description"
                rows="4"
                onChange={(e) => setDescription(e.target.value)}
                style={{ color: "black" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-light"
                placeholder={user.description}
              ></textarea>
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Ubicación
              </label>
              <input
                id="location"
                onChange={(e) => setHomeplace(e.target.value)}
                style={{ color: "black" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={user.homeplace}
              />
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-white"
              >
                Imagen
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-light text-white"
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
                Modificar usuario
              </button>
            )}
            <button
              className="w-full py-2 text-white rounded-md transition-colors"
              onClick={() => navigate(-1)}
            >
              Volver
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditUserForm;
