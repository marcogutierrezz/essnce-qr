import { Link } from "react-router-dom"

function Navbar() {
    return (
        <nav style={styles.nav}>
            <h2 style={styles.logo}>ESSNCE</h2>

            <div style={styles.links}>
                <Link to="/" style={styles.link}>Inicio</Link>
                <Link to="/scan" style={styles.link}>Escanear</Link>
                <Link to="/admin" style={styles.link}>Admin</Link>
                <Link to="/generate" style={styles.link}>Generar QR</Link>
            </div>
        </nav>
    )
}

const styles = {
    nav: {
        background: "#111827",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #1f2937"
    },
    logo: {
        color: "#6366f1"
    },
    links: {
        display: "flex",
        gap: "20px"
    },
    link: {
        color: "white",
        textDecoration: "none",
        fontWeight: "500"
    }
}

export default Navbar