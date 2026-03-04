import { useNavigate } from "react-router-dom"

function Home() {

    const navigate = useNavigate()

    return (
        <div className="home-container">

            <div className="home-center">

                <h1 className="home-title">ESSNCE</h1>
                <p className="home-subtitle">Sistema Oficial de Entradas</p>

                <div className="home-buttons">

                    <button
                        className="home-btn scan"
                        onClick={() => navigate("/scan")}
                    >
                        Escanear Entradas
                    </button>

                    <button
                        className="home-btn admin"
                        onClick={() => navigate("/admin")}
                    >
                        Panel Admin
                    </button>

                </div>

            </div>

        </div>
    )
}

export default Home