import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./navbar.css";
import defaultProfile from "../images/defaultProfile.jpg";
import { Search, LogOut } from "lucide-react";
import { useSharedAuth } from "../services/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const { handleLogout, getAccessToken, userInfo, getSub } = useSharedAuth();

  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (userInfo) {
      setUserName(userInfo.name);
    }
  }, [userInfo]);

  // const [isSearchVisible, setIsSearchVisible] = useState(false)
  // const toggleSearch = () => {
  //   setIsSearchVisible(!isSearchVisible)
  // }

  const handleLogoutButton = () => {
    handleLogout();
    navigate("/login");
  };

  const accessToken = getAccessToken();
  const sub = getSub();

  return (
    <header className="header">
      <div className="header-left">
        <img
          src="/logo.png"
          alt="EvenGOD Logo"
          className="logo cursor-pointer"
          onClick={() => navigate(`/`)}
        />
        <h1
          className="text-3xl font-bold cursor-pointer"
          onClick={() => navigate(`/`)}
        >
          EvenGOD
        </h1>
        <nav>
          <ul>
            <li>
              <button onClick={() => navigate("/")}>Explorar</button>
            </li>
            {accessToken ? (
              <>
                <li>
                  <button onClick={() => navigate("/my-events")}>
                    Mis Eventos
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/create-event")}>
                    Crear Evento
                  </button>
                </li>
              </>
            ) : (
              <></>
            )}
          </ul>
        </nav>
      </div>
      <div className="header-right">
        {/* <div className={`search-bar ${isSearchVisible ? "visible" : ""}`}>
          <button className="search-icon" onClick={toggleSearch}>
            <Search size={24} />
          </button>
          <input type="text" placeholder="Buscar..." className={isSearchVisible ? "visible" : ""} />
        </div> */}
        {accessToken ? (
          <>
            <div
              className="user-info cursor-pointer"
              onClick={() => navigate(`/profile/${sub}`)}
            >
              <img
                src={defaultProfile}
                alt="User Avatar"
                className="user-avatar"
              />
              <span className="username">{userName}</span>
            </div>
            <button
              className="flex items-center ml-4 transition"
              onClick={handleLogoutButton}
            >
              <LogOut size={24} className="mr-1 search-icon" />
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center ml-4 transition"
          >
            Iniciar Sesión
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
