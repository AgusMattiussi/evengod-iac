import React, { useState } from "react"
import Header from "../components/header"
import { useNavigate } from "react-router-dom"
import { apiPost } from "../services/api"

// const topics = ["Blockchain", "AI", "DevOps", "Data Science", "Ciberseguridad", "Cloud Computing", "Big Data"]

const SignUp = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // const [selectedTopics, setSelectedTopics] = useState([])
  // const handleTopicClick = (topic) => {
  //   setSelectedTopics((prevTopics) =>
  //     prevTopics.includes(topic) ? prevTopics.filter((t) => t !== topic) : [...prevTopics, topic],
  //   )
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = {
        username,
        email,
        password,
        // topics: selectedTopics,
      }

      await apiPost("/users", data)

      // Navigate to login or success page after successful registration
      navigate("/login")
    } catch (error) {
      console.error("Error during registration:", error)
    }
  }

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-darker to-secondary">
        <div className="w-full max-w-md p-8 bg-blue-darker rounded shadow">
          <h2 className="text-2xl font-bold text-center mb-6">Registrate</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Nombre de Usuario
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ color: "black" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ color: "black" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ color: "black" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Tópicos de Interés</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicClick(topic)}
                    className={`px-3 py-1 border rounded-full ${
                      selectedTopics.includes(topic) ? "bg-blue-light text-white" : "bg-gray-200 text-gray-700"
                    } hover:bg-indigo-700 hover:text-white transition-colors`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div> */}
            <button
              type="submit"
              className="w-full py-2 bg-blue-light text-white rounded-md hover:bg-blue transition-colors"
            >
              Registrarse
            </button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => navigate("/login")} className="text-sm text-indigo-600 hover:text-blue-light">
              ¿Ya tienes cuenta? Inicia sesión aquí
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUp