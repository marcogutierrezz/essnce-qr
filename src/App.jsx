import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './Home'
import Validate from './Validate'
import Scan from './Scan'
import Admin from './Admin'
import GenerateQR from './GenerateQR'
import Navbar from './Navbar'

function App() {

  const location = useLocation()

  const hideNavbar = location.pathname.startsWith("/validate")

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/validate/:code" element={<Validate />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/generate" element={<GenerateQR />} />
      </Routes>
    </>
  )
}

export default App