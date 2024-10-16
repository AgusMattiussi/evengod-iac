import React, { useState, useEffect, useCallback } from "react"
import { apiGet } from "../services/api"
import { useNavigate } from "react-router-dom"
import { HttpStatusCode } from "axios"
import { Loader } from "../components/loader"
import Navbar from "../components/navbar"
import MyEventCard from "../components/myEventCard"
import { useSharedAuth } from "../services/auth"

const MyEvents = () => {
  const navigate = useNavigate()
  const { getAccessToken } = useSharedAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchInscriptions = useCallback(async (user_id) => {
    setLoading(true)

    try {
      const response = await apiGet(`/users/${user_id}/events`)
      if (response.status === HttpStatusCode.InternalServerError) {
        navigate("/500")
      } else if (response.status === HttpStatusCode.NoContent) {
        setEvents([])
      } else {
        setEvents(response.data)
      }
    } catch (error) {
      console.error("Error fetching inscriptions:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loading) {
      fetchInscriptions(getAccessToken())
    }
  }, [loading])

  return (
    <main>
      <Navbar />
      <div className="main-container bg-gradient-to-b from-blue-darker to-secondary h-100">
        <div className="content-area h-100 m-auto">
          <h2 className="text-3xl font-bold m-auto">Mis Eventos</h2>
          <div className="w-2/3 min-h-screen m-auto text-white p-6">
            {loading ? (
              <Loader />
            ) : (
              events
                .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                .map((event) => <MyEventCard key={event.id} event={event} />)
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default MyEvents
