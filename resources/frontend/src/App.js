import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import "./App.css"
import SignUp from "./views/signup"
import Login from "./views/login"
import Home from "./views/home"
import EventForm from "./views/eventForm"
import Event from "./views/event"
import Profile from "./views/profile"
import MyEvents from "./views/myEvents"
import NotFound from "./views/notFound"
import { useSharedAuth } from "./services/auth"

const App = () => {
  const { userInfo } = useSharedAuth()

  return (
    <div className="app">
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          {/* {userInfo === null ? (
            <Route path="/" element={<Navigate to="/login" />} />
          ) : (
            <Route path="/" element={<Navigate to="/" />} />
          )} */}
          <Route path="/" element={<Home />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/create-event" element={<EventForm />} />
          <Route path="/events/:id" element={<Event />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
