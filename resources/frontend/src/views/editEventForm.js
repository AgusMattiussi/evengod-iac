import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/header";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../services/api";
import { Loader } from "../components/loader";
import { HttpStatusCode } from "axios";
import { useSharedAuth } from "../services/auth";

const EditEventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { getAccessToken } = useSharedAuth();

  const [event, setEvent] = useState({});

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
  const [responseLoading, setResponseLoading] = useState(false);

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

  const fetchEvent = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiGet(`/events/${id}`);
      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500");
      } else if (response.status === HttpStatusCode.NoContent) {
        setEvent({});
      } else {
        setEvent(response.data);
        setTitle(response.data.title);
        setDescription(response.data.description);
        setStartDate(response.data.start_date);
        setEndDate(response.data.end_date);
        setModality(response.data.modality);
        setLocation(response.data.location);
        setVirtualRoomLink(response.data.virtual_room_link);
        setCategoryId(response.data.category_id);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) {
      fetchEvent();
      fetchCategories();
    }
  }, []);

  const parseToISOString = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    date.setHours(now.getHours());
    date.setMinutes(now.getMinutes());
    return date.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseLoading(true);
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
      const response = await apiPut(`/events/${id}`, data);
      if (imageBase64 !== "") {
        const imageData = {
          data: imageBase64,
        };
        await apiPut(`/events/${id}/image`, imageData);
      }
      navigate("/");
    } catch (error) {
      console.error("Error during updating the event:", error);
    } finally {
      setResponseLoading(false);
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
          <h2 className="text-2xl font-bold text-center mb-6">Editar evento</h2>
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
                placeholder={event.title}
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
                placeholder={event.description}
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
                placeholder={event.location}
              />
            </div>
            <div>
              <label
                htmlFor="beginDate"
                className="block text-sm font-medium text-white"
              >
                Fecha Inicio del Evento
              </label>
              <input
                type="datetime-local"
                id="startdate"
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 borderrounded-md focus:outline-none focus:ring-2 focus:ring-blue-light text-blue-darker"
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
                type="datetime-local"
                id="endDate"
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-light text-blue-darker"
              />
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
                      checked={
                        (event.modality === "In-Person" && modality === "") ||
                        modality === "In-Person"
                      }
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
                      checked={
                        (event.modality === "Virtual" && modality === "") ||
                        modality === "Virtual"
                      }
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
                      checked={
                        (event.modality === "Hybrid" && modality === "") ||
                        modality === "Hybrid"
                      }
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
                  placeholder={event.virtual_room_link}
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
                placeholder={event.image_url}
              />
            </div>
            {responseLoading ? (
              <div className="flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-2 bg-blue-light text-white rounded-md hover:bg-blue transition-colors"
              >
                Modificar evento
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

export default EditEventForm;
