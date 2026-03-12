import { Routes, Route } from "react-router-dom"
import Navbar from "./Navbar"
import Home from "./Home"
import Admin from "./Admin"
import Scan from "./Scan"
import PinGate from "./PinGate"

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-content">
        <Routes>

          <Route path="/" element={<Home />} />

          <Route
            path="/admin"
            element={
              <PinGate>
                <Admin />
              </PinGate>
            }
          />

          <Route
            path="/scan"
            element={
              <PinGate>
                <Scan />
              </PinGate>
            }
          />

        </Routes>
      </div>
    </div>
  )
}

export default App