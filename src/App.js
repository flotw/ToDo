import React from "react"
import ToDo from "./Components/ToDo"
import { Route, Routes, useLocation } from "react-router-dom"

export default function App() {
  // const location = useLocation();

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path='/' element={<ToDo />} />
        </Routes>
      </div>
    </div>
  )
}