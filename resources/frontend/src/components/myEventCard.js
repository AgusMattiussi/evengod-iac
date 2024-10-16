import React, { useState, useEffect, useCallback } from "react"
import { apiGet } from "../services/api"
import { useNavigate } from "react-router-dom"
import { HttpStatusCode } from "axios"
import defaultEventImage from "../images/defaultEvent.jpg"

const MyEventCard = ({ event }) => {
  const navigate = useNavigate()

  const [category, setCategory] = useState({})
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    if (loading) {
      fetchCategoryById(event.category_id)
    }
  }, [loading])

  const parseDate = (isoDateString) => {
    const date = new Date(isoDateString)

    const day = date.getUTCDate().toString().padStart(2, "0")
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
    const year = date.getUTCFullYear()

    return `${day}/${month}/${year}`
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

  return (
    <div className="relative flex" onClick={() => navigate(`/events/${event.id}`)}>
      <div className="flex-grow pb-8">
        <div className="absolute w-4 h-4 bg-gray-200 rounded-full mt-1.5 -start-6 border border-white"></div>
        {/* TODO: Add timeline */}
        {/* <div class="h-[220px] w-0.5 self-stretch bg-secondary"></div> */}
        <p className="text-lg font-bold ml-4 mb-2">{parseDate(event.start_date)}</p>
        <div
          className="bg-blue-darker rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
          onClick={() => navigate("/event")}
        >
          <div className="flex justify-between">
            <div>
              <h3 className="text-white text-2xl font-semibold mb-1">{event.title}</h3>
              <p className="text-m mb-1 text-blue-lighter">{translateModality(event.modality)}</p>
              <p className="text-m mb-2 flex items-center text-blue-lighter">
                <span className="mr-1">📍</span> {event.location}
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 rounded-full bg-secondary text-white">{category.name}</div>
              </div>
            </div>
            <img
              src={event.image_url || defaultEventImage}
              alt={event.title}
              className="w-60 h-40 object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyEventCard
