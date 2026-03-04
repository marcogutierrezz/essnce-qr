import { useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { useNavigate } from "react-router-dom"

function Scan() {

    const navigate = useNavigate()

    useEffect(() => {

        const qr = new Html5Qrcode("reader")

        qr.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {

                // Extraer el código al final del URL
                const parts = decodedText.split("/")
                const code = parts[parts.length - 1]

                qr.stop().then(() => {
                    navigate(`/validate/${code}`)
                })

            },
            () => { }
        )

        return () => {
            qr.stop().catch(() => { })
        }

    }, [])

    return (
        <div className="container">
            <h1>Escanear Entrada</h1>
            <div id="reader" style={{ width: "100%", maxWidth: "400px" }}></div>
        </div>
    )
}

export default Scan