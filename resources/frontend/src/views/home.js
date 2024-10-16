import React, { useState, useEffect, useCallback } from "react"
import { apiGet } from "../services/api"
import { useNavigate } from "react-router-dom"
import { HttpStatusCode } from "axios"
import Filters from "../components/filters"
import Navbar from "../components/navbar"
import EventCarousel from "../components/eventCarousel"
import { Loader } from "../components/loader"

const Home = () => {
  const mainCategories = [
    "Tecnología",
    "Medioambiente",
    "Salud",
    "Educación",
    "Finanzas",
    "Emprendimiento",
    "Ciencia",
    "Arte y Cultura",
    "Psicología",
    "Política",
  ]

  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [categories, setCategories] = useState({
    1: { id: 2, name: "Tecnología", isChecked: false },
    2: { id: 3, name: "Medioambiente", isChecked: false },
    3: { id: 4, name: "Salud", isChecked: false },
    4: { id: 5, name: "Educación", isChecked: false },
    5: { id: 6, name: "Finanzas", isChecked: false },
    6: { id: 7, name: "Emprendimiento", isChecked: false },
    7: { id: 8, name: "Ciencia", isChecked: false },
    8: { id: 9, name: "Arte y Cultura", isChecked: false },
    9: { id: 10, name: "Psicología", isChecked: false },
    10: { id: 11, name: "Política", isChecked: false },
  })
  const [categoryId, setCategoryId] = useState("")
  const [modality, setModality] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [location, setLocation] = useState("")

  const fetchEvents = useCallback(async (categoryId, modality, location) => {
    setLoading(true)

    const queryParams = {}

    if (categoryId) queryParams.category_id = categoryId
    if (modality) queryParams.modality = modality
    if (location) queryParams.location = location

    try {
      const response = await apiGet("/events", queryParams)
      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500")
      } else if (response.status === HttpStatusCode.NoContent) {
        setEvents([])
      } else {
        setEvents(response.data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loading) {
      fetchEvents(categoryId, modality, location)
    }
  }, [loading])

  const filteredEvents = (categoryName) => {
    const categoryId = Object.values(categories).find((category) => category.name === categoryName).id
    return events.filter((event) => event.category_id === categoryId)
  }

  return (
    <main>
      <Navbar />
      <div className="main-container bg-gradient-to-b from-blue-darker to-secondary">
        <Filters
          category={categoryId}
          setCategory={setCategoryId}
          categories={categories}
          setCategories={setCategories}
          modality={modality}
          setModality={setModality}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          location={location}
          setLocation={setLocation}
          setLoading={setLoading}
        />
        <div className="content-area">
          {loading ? (
            <Loader />
          ) : (
            mainCategories
              .map((category) => {
                const eventsForCategory = filteredEvents(category) // Filtrar eventos por categoría
                return { category, eventsForCategory } // Devuelve un objeto con la categoría y los eventos filtrados
              })
              .filter(({ eventsForCategory }) => eventsForCategory.length > 0) // Filtra solo las categorías que tienen eventos
              .map(({ category, eventsForCategory }) => (
                <EventCarousel key={category.id} title={category} events={eventsForCategory} />
              ))
          )}
        </div>
      </div>
    </main>
  )
}

export default Home
