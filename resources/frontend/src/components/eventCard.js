import React from "react"
import { useNavigate } from "react-router-dom"
import defaultEventImage from "../images/defaultEvent.jpg"
import "./eventCard.css"

const EventCard = ({ event }) => {
  const navigate = useNavigate()

  const parseDate = (isoDateString) => {
    const date = new Date(isoDateString)

    const day = date.getUTCDate().toString().padStart(2, "0")
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
    const year = date.getUTCFullYear()

    return `${day}/${month}/${year}`
  }

  return (
    <div className="event-card cursor-pointer mx-1" onClick={() => navigate(`/events/${event.id}`)}>
      <img src={event.image_url ? event.image_url : defaultEventImage} alt={event.title} />
      <h3 className="text-xl font-bold">{event.title}</h3>
      <p>{parseDate(event.start_date)}</p>
    </div>
  )
}

export default EventCard
