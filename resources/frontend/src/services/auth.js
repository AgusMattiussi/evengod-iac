import { useState } from "react";
import { useBetween } from "use-between";

const useAuth = () => {
  const [userInfo, setUserInfo] = useState(() => {
    const token = localStorage.getItem("accessToken");
    return token;
  });

  const getAccessToken = () => {
    return localStorage.getItem("accessToken");
  };

  const getUserName = () => {
    return localStorage.getItem("userName");
  };

  const setAccessToken = (token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
      setUserInfo(token);
    } else {
      localStorage.removeItem("accessToken");
    }
  };

  const setUserName = (name) => {
    localStorage.setItem("userName", name);
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
    setUserName,
    userInfo,
    setUserInfo,
    handleLogout,
  };
};

export const useSharedAuth = () => useBetween(useAuth);
