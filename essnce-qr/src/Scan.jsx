import { useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { useNavigate } from "react-router-dom"

function Scan() {

    const navigate = useNavigate()

    useEffect(() => {

        const qr = new Html5Qrcode("reader")

        qr.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: 250
            },
            (decodedText) => {

                qr.stop()
                navigate(decodedText.replace(window.location.origin, ""))

            },
            (errorMessage) => {
                // ignora errores mientras busca QR
            }
        )

        return () => {
            qr.stop().catch(() => { })
        }

    }, [])

    return (
        <div style={{ padding: "20px" }}>
            <h1>Escanear Entrada</h1>
            <div id="reader" style={{ width: "300px" }}></div>
        </div>
    )
}

export default Scan