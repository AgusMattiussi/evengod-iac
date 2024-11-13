import React, { useState, useEffect, useCallback } from "react";
import { apiGet, apiDelete } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { HttpStatusCode } from "axios";
import Navbar from "../components/navbar";
import { Loader } from "../components/loader";
import { Pencil } from "lucide-react";
import defaultProfileImage from "../images/defaultProfile.jpg";
import { useSharedAuth } from "../services/auth";
import MyEventCard from "../components/myEventCard";

const Profile = () => {
  const navigate = useNavigate();
  const { setUserInfo, getSub } = useSharedAuth();

  const [user, setUser] = useState({});
  const [events, setEvents] = useState([]);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiGet(`/users/${id}`);
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

  const fetchEvents = useCallback(async (user_id) => {
    setLoading(true);

    const queryParams = {};

    if (user_id) queryParams.user_uuid = user_id;

    try {
      const response = await apiGet(`/events`, queryParams);
      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500");
      } else if (response.status === HttpStatusCode.NoContent) {
        setEvents([]);
      } else {
        setEvents(response.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) {
      fetchUser();
      fetchEvents(id);
    }
  }, [user]);

  const handleEditProfile = () => {
    navigate(`/profile/${id}/edit`);
  };

  const handleEventDelete = async (eventId) => {
    try {
      const response = await apiDelete(`/events/${eventId}`);
      if (response.status === HttpStatusCode.Ok) {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const isProfileOwner = id === getSub();

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-darker to-secondary">
        {loading ? (
          <Loader />
        ) : (
          <div className="text-white min-h-screen">
            <div className="container mx-auto px-4 py-8">
              <main className="grid grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-1 mx-10">
                  <img
                    src={
                      user.profile_image_url
                        ? user.profile_image_url
                        : defaultProfileImage
                    }
                    alt="Conference"
                    className="size-64 rounded-lg shadow-lg mr-8"
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="flex">
                    <h1 className="text-5xl font-bold mb-4 mr-2">
                      {user.name}
                    </h1>
                    {isProfileOwner ? (
                      <button
                        className="text-gray-500 hover:text-blue-light ml-5 mb-3"
                        aria-label="Edit profile"
                        onClick={handleEditProfile}
                      >
                        <Pencil className="h-6 w-6" />
                      </button>
                    ) : (
                      <> </>
                    )}
                  </div>
                  <p className="mb-6 text-gray-400">{user.description}</p>
                  <h2 className="text-2xl font-bold mt-10 mb-4">
                    Eventos creados
                  </h2>
                  {loading ? (
                    <Loader />
                  ) : events.length === 0 ? (
                    <p className="text-gray-500 text-center mt-4">
                      No hay eventos creados
                    </p>
                  ) : (
                    events
                      .sort(
                        (a, b) =>
                          new Date(a.start_date) - new Date(b.start_date)
                      )
                      .map((event) => (
                        <MyEventCard
                          key={event.id}
                          event={event}
                          editable={isProfileOwner}
                          onDelete={handleEventDelete}
                        />
                      ))
                  )}
                </div>
              </main>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
