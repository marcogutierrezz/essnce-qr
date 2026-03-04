import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import Validate from './Validate'
import Scan from './Scan'
import Admin from './Admin'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/validate/:code" element={<Validate />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App