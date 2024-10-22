import { useState, useEffect } from "react";
import { useBetween } from "use-between";
import { apiGet } from "./api";

const useAuth = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const sub = localStorage.getItem("sub");
      if (sub) {
        try {
          const response = await apiGet(`/users/${sub}`);
          setUserInfo(response.data);
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      }
    };

    fetchUserInfo();
  }, []);

  const getAccessToken = () => {
    return localStorage.getItem("accessToken");
  };

  const setAccessToken = async (token) => {
    if (token) {
      const sub = localStorage.getItem("sub");
      const response = await apiGet(`/users/${sub}`);
      setUserInfo(response.data);
    } else {
      localStorage.removeItem("accessToken");
    }
  };

  const getSub = () => {
    return localStorage.getItem("sub");
  };

  const handleLogout = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("sub");
    setUserInfo(null);
  };

  return {
    getAccessToken,
    setAccessToken,
    userInfo,
    setUserInfo,
    getSub,
    handleLogout,
  };
};

export const useSharedAuth = () => useBetween(useAuth);
