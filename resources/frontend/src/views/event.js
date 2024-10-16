import React, { useState, useEffect, useCallback } from "react"
import { apiGet, apiPost } from "../services/api"
import { useNavigate, useParams } from "react-router-dom"
import { HttpStatusCode } from "axios"
import Navbar from "../components/navbar"
import { Loader } from "../components/loader"
import defaultEventImage from "../images/defaultEvent.jpg"
import { useSharedAuth } from "../services/auth"

const Event = () => {
  const navigate = useNavigate()

  const [event, setEvent] = useState({})
  const [category, setCategory] = useState({})
  const [inscriptions, setInscriptions] = useState([])

  const { id } = useParams()
  const { getAccessToken } = useSharedAuth()
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchCategoryById = useCallback(async (categoryId) => {
    try {
      const response = await apiGet(`/categories/${categoryId}`)
      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500")
      } else if (response.status === HttpStatusCode.NoContent) {
        setCategory({})
      } else {
        setCategory(response.data)
      }
    } catch (error) {
      console.error("Error fetching event:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchInscriptionsForEvent = useCallback(async (eventId) => {
    try {
      let queryParams = {}

      queryParams.event_id = eventId
      const response = await apiGet("/inscriptions", queryParams)

      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500")
      } else if (response.status === HttpStatusCode.NoContent) {
        setInscriptions([])
      } else {
        setInscriptions(response.data)
      }
    } catch (error) {
      console.error("Error fetching event:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEvent = useCallback(async () => {
    setLoading(true)

    try {
      const response = await apiGet(`/events/${id}`)
      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500")
      } else if (response.status === HttpStatusCode.NoContent) {
        setEvent({})
      } else {
        setEvent(response.data)
        fetchCategoryById(response.data.category_id)
        fetchInscriptionsForEvent(response.data.id)
      }
    } catch (error) {
      console.error("Error fetching event:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loading) {
      fetchEvent()
    }
  }, [])

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleInscription = async () => {
    try {
      const data = {
        user_id: getAccessToken(),
        event_id: id,
        state: "Registered",
      }
      const response = await apiPost("/inscriptions", data)
      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500")
      } else if (response.status === HttpStatusCode.Created) {
        fetchInscriptionsForEvent(event.id)
      }
    } catch (error) {
      console.error("Error registering inscription:", error)
    }
    closeModal()
  }

  const formatEventDate = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const startMonth = start.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    const startDay = start.getDate() + 1
    const endMonth = end.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    const endDay = end.getDate() + 1

    const year = start.getFullYear()

    if (startDate === endDate) {
      return `${startMonth} ${startDay}, ${year}`
    } else if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
    }
  }

  const translateModality = (modality) => {
    switch (modality) {
      case "In-Person":
        return "Presencial"
      case "Virtual":
        return "Virtual"
      case "Hybrid":
        return "Híbrido"
      default:
        return "No especificado"
    }
  }

  const accessToken = getAccessToken()

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-darker to-secondary">
        {loading ? (
          <Loader />
        ) : (
          <div className="text-white min-h-screen">
            <div className="container mx-auto px-4 py-8">
              <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="w-600 ">
                    <img
                      src={event.image_url || defaultEventImage}
                      alt="Conference"
                      className="h-72 min-w-full rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="mt-6 mx-auto flex justify-center">
                    <div className="bg-blue-darker text-white p-3 mr-5 rounded-lg shadow-md flex flex-col items-center">
                      <span className="text-3xl font-bold">{inscriptions.length}</span>
                      <span className="text-sm mt-2">Inscriptos</span>
                    </div>
                    <div className="bg-blue-darker text-white p-3 rounded-lg shadow-md flex flex-col items-center">
                      <span className="text-3xl font-bold">{translateModality(event.modality)}</span>
                      <span className="text-sm mt-2">Modalidad</span>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <header className="mb-8 flex items-center content-center">
                    <p className="text-sm">
                      {formatEventDate(event.start_date, event.end_date)} • {event.location}
                    </p>
                    <div className="flex flex-wrap gap-2 mx-5">
                      <div className="px-3 py-1 rounded-full bg-secondary text-white">{category.name}</div>
                    </div>
                  </header>
                  <h1 className="text-5xl font-bold mb-4">{event.title}</h1>
                  <p className="mb-6 text-gray-400">{event.description}</p>
                  <div className="flex justify-center space-x-4">
                    {accessToken ? (
                      <button
                        type="button"
                        onClick={openModal}
                        className="w-1/2 py-2 bg-blue-light text-white rounded-md hover:bg-blue-darker hover:text-white transition-colors"
                      >
                        Anótate ahora
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="w-1/2 py-2 bg-blue-light text-white rounded-md hover:bg-blue-darker hover:text-white transition-colors"
                      >
                        Anótate ahora
                      </button>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-blue-darker bg-opacity-40 z-50">
          <div className="bg-blue-darker rounded-lg p-6" style={{ width: "500px" }}>
            <h2 className="text-xl font-bold mb-4">Confirmación de Registro</h2>
            <p className="mb-4">¿Estás seguro de que deseas anotarte al evento?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-blue-light hover:text-white transition-colors"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-light text-white rounded-md hover:bg-blue hover:text-white transition-colors"
                onClick={handleInscription}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Event
