import React, { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import EventCard from "./eventCard"
import "./eventCarousel.css"

const EventCarousel = ({ title, events }) => {
  const [startIndex, setStartIndex] = useState(0)

  const nextSlide = () => {
    setStartIndex((prevIndex) => (prevIndex + 1) % events.length)
  }

  const prevSlide = () => {
    setStartIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length)
  }

  const visibleEvents = [...events.slice(startIndex), ...events.slice(0, startIndex)].slice(0, 4)

  return (
    <section className="event-carousel my-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        {events.length < 4 ? (
          <></>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              aria-label="Previous events"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              aria-label="Next events"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
      <div className="carousel-container p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-blue-darker w-fit rounded-md">
        {visibleEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  )
}

export default EventCarousel
