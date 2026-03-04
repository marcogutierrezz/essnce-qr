import { Link, useLocation } from "react-router-dom"

function Navbar() {

    const location = useLocation()

    return (
        <div className="navbar">

            <div className="logo">
                ESSNCE
            </div>

            <div className="nav-links">

                <Link
                    to="/"
                    className={location.pathname === "/" ? "nav-item active" : "nav-item"}
                >
                    Inicio
                </Link>

                <Link
                    to="/scan"
                    className={location.pathname === "/scan" ? "nav-item active" : "nav-item"}
                >
                    Escanear
                </Link>

                <Link
                    to="/admin"
                    className={location.pathname === "/admin" ? "nav-item active" : "nav-item"}
                >
                    Admin
                </Link>

            </div>

        </div>
    )
}

export default Navbar