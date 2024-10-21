import { useState } from "react";
import { useBetween } from "use-between";
import { apiGet } from "./api";

const useAuth = () => {
  const [userInfo, setUserInfo] = useState(() => {
    const sub = localStorage.getItem("sub");
    const response = apiGet(`/users/${sub}`);
    return response.data;
  });

  const getAccessToken = () => {
    return localStorage.getItem("accessToken");
  };

  const getUserName = () => {
    return localStorage.getItem("userName");
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

  const handleLogout = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUserInfo(null);
  };

  return {
    getAccessToken,
    setAccessToken,
    getUserName,
    userInfo,
    setUserInfo,
    handleLogout,
  };
};

export const useSharedAuth = () => useBetween(useAuth);
