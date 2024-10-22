import React from "react";
import "./navbar.css";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-left">
        <img
          src="/logo.png"
          alt="Event Hub Logo"
          className="logo cursor-pointer mt-3"
          onClick={() => navigate(`/`)}
        />
        <h1
          className="text-3xl font-bold cursor-pointer mt-3"
          onClick={() => navigate(`/`)}
        >
          EvenGOD
        </h1>
      </div>
    </header>
  );
};

export default Header;
