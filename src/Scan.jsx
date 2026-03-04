import { useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { useNavigate } from "react-router-dom"

function Scan() {

    const navigate = useNavigate()
    const qrRef = useRef(null)

    useEffect(() => {

        const qr = new Html5Qrcode("reader")
        qrRef.current = qr

        qr.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            async (decodedText) => {

                const parts = decodedText.split("/")
                const code = parts[parts.length - 1]

                try {
                    await qr.stop()
                    await qr.clear()
                } catch (err) {
                    console.log("Error stopping camera", err)
                }

                // Pequeño delay para Safari
                setTimeout(() => {
                    navigate(`/validate/${code}`)
                }, 300)

            },
            () => { }
        )

        return () => {
            if (qrRef.current) {
                qrRef.current.stop().catch(() => { })
            }
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