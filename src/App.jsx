import { Routes, Route } from "react-router-dom"
import Navbar from "./Navbar"
import Home from "./Home"
import Admin from "./Admin"
import Scan from "./Scan"

function App() {
  return (
    <div className="app-layout">
      <Navbar />

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/scan" element={<Scan />} />
        </Routes>
      </div>
    </div>
  )
}

export default App