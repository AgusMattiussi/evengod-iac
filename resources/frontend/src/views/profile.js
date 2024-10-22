import React, { useState, useEffect, useCallback } from "react";
import { apiGet } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { HttpStatusCode } from "axios";
import Navbar from "../components/navbar";
import { Loader } from "../components/loader";
import defaultProfileImage from "../images/defaultProfile.jpg";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiGet(`/users/${id}`);
      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500");
      } else if (response.status === HttpStatusCode.NoContent) {
        setUser({});
      } else {
        setUser(response.data);
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
    }
  }, []);

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
                    src={defaultProfileImage}
                    alt="Conference"
                    className="size-64 rounded-lg shadow-lg"
                  />
                </div>
                <div className="lg:col-span-2">
                  <h1 className="text-5xl font-bold mb-4">{user.name}</h1>
                  <p className="mb-6text-gray-400">{user.description}</p>
                  {/*<p className="mb-3 text-xl text-gray-400">Tópicos de interes:</p>
                 <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <div key={topic} className="px-3 py-1 rounded-full bg-secondary text-white">
                      {topic}
                    </div>
                  ))}
                </div> */}
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
