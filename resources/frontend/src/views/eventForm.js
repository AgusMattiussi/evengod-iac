import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";
import { apiPost, apiGet, apiPut } from "../services/api";
import { Loader } from "../components/loader";
import { HttpStatusCode } from "axios";
import { useSharedAuth } from "../services/auth";

const EventForm = () => {
  const navigate = useNavigate();
  const { getAccessToken } = useSharedAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modality, setModality] = useState("");
  const [location, setLocation] = useState("");
  const [virtualRoomLink, setVirtualRoomLink] = useState("");
  const [categoryId, setCategoryId] = useState(1);
  const [imageBase64, setImageBase64] = useState("");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await apiGet("/categories");
      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500");
      } else if (response.status === HttpStatusCode.NoContent) {
        setCategories([]);
      } else {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) {
      fetchCategories();
    }
  }, []);

  const parseToISOString = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString(); // Añade 00:00:00.000Z
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isoStartDate = parseToISOString(startDate);
    const isoEndDate = parseToISOString(endDate);
    try {
      const data = {
        title,
        description,
        start_date: isoStartDate,
        end_date: isoEndDate,
        inscriptions_start_date: isoStartDate,
        inscriptions_end_date: isoEndDate,
        modality,
        location,
        virtual_room_link: virtualRoomLink,
        state: "Open",
        category_id: Number(categoryId),
        user_id: Number(getAccessToken()),
      };
      const response = await apiPost("/events", data);
      const eventId = response.data.eventId;
      if (imageBase64 !== "") {
        const imageData = {
          data: imageBase64,
        };
        await apiPut(`/events/${eventId}/image`, imageData);
      }
      navigate("/");
    } catch (error) {
      console.error("Error during creation of event:", error);
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
          <h2 className="text-2xl font-bold text-center mb-6">
            Crear nuevo evento
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Título
              </label>
              <input
                id="title"
                onChange={(e) => setTitle(e.target.value)}
                style={{ color: "black" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
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
                required
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
                onChange={(e) => setLocation(e.target.value)}
                style={{ color: "black" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="flex justify-between">
              <div>
                <label
                  htmlFor="beginDate"
                  className="block text-sm font-medium text-white"
                >
                  Fecha Inicio del Evento
                </label>
                <input
                  type="date"
                  id="startdate"
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-light"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-white"
                >
                  Fecha Fin del Evento
                </label>
                <input
                  type="date"
                  id="endDate"
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-light"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white">
                Modalidad
              </label>
              <div className="flex justify-evenly">
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="modality"
                      value="In-Person"
                      checked={modality === "In-Person"}
                      onChange={() => setModality("In-Person")}
                    />
                    <span className="text-white">Presencial</span>
                  </label>
                  <label className="inline-flex items-center ml-6">
                    <input
                      type="radio"
                      className="form-radio"
                      name="modality"
                      value="Virtual"
                      checked={modality === "Virtual"}
                      onChange={() => setModality("Virtual")}
                    />
                    <span className="text-white">Virtual</span>
                  </label>
                  <label className="inline-flex items-center ml-6">
                    <input
                      type="radio"
                      className="form-radio"
                      name="modality"
                      value="Hybrid"
                      checked={modality === "Hybrid"}
                      onChange={() => setModality("Hybrid")}
                    />
                    <span className="text-white">Híbrido</span>
                  </label>
                </div>
              </div>
            </div>
            {(modality === "Virtual") | (modality === "Hybrid") ? (
              <div>
                <label
                  htmlFor="virtualRoomLink"
                  className="block text-sm font-medium text-white"
                >
                  Enlace de la sala virtual
                </label>
                <input
                  id="virtualRoomLink"
                  onChange={(e) => setVirtualRoomLink(e.target.value)}
                  style={{ color: "black" }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            ) : (
              <></>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {loading ? (
                  <Loader />
                ) : (
                  <div className="flex flex-col items-center w-full">
                    <select
                      onChange={(e) => setCategoryId(e.target.value)}
                      value={categoryId}
                      className="w-full px-3 py-2 border rounded-md bg-gray-200 text-blue-darker focus:outline-none focus:ring-2 focus:ring-blue-light"
                    >
                      <option value="" disabled>
                        Selecciona una categoría
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
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
            <button
              type="submit"
              className="w-full py-2 bg-blue-light text-white rounded-md hover:bg-blue transition-colors"
            >
              Crear evento
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EventForm;
