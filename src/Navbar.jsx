import { useNavigate } from "react-router-dom"

function Navbar() {

    const navigate = useNavigate()

    return (

        <div className="navbar">

            <div
                className="nav-logo"
                onClick={() => navigate("/")}
                style={{ cursor: "pointer" }}
            >
                ESSNCE
            </div>

            <div className="nav-links">

                <button onClick={() => navigate("/scan")}>
                    Scan
                </button>

                <button onClick={() => navigate("/admin")}>
                    Admin
                </button>

            </div>

        </div>

    )

}

export default Navbar