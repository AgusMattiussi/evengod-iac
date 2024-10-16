import React from "react"
import Header from "../components/header"
import { useNavigate } from "react-router-dom"

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-darker to-secondary">
        <div className="w-full max-w-md p-8 rounded shadow bg-blue-darker">
          <h2 className="text-4xl font-bold text-center mb-6">Página no encontrada</h2>
          <p className="text-center text-lg mb-6">La página que buscas no existe.</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-2 bg-blue-light text-white rounded-md hover:bg-blue transition-colors"
          >
            Regresar al inicio
          </button>
        </div>
      </div>
    </>
  )
}

export default NotFound
