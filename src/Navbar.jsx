import { Link } from "react-router-dom"
import "./App.css"

function Navbar() {
    return (
        <div className="navbar">
            <div className="nav-logo">ESSNCE</div>

            <div className="nav-links">
                <Link className="nav-link" to="/">Inicio</Link>
                <Link className="nav-link" to="/scan">Escanear</Link>
                <Link className="nav-link" to="/admin">Admin</Link>
            </div>
        </div>
    )
}

export default Navbar