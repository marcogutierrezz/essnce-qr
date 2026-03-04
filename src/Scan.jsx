import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { supabase } from "./supabaseClient"
import "./App.css"

function Scan() {

    const qrRef = useRef(null)
    const [result, setResult] = useState(null)
    const [scanning, setScanning] = useState(true)

    useEffect(() => {

        const qr = new Html5Qrcode("reader")
        qrRef.current = qr

        startScanner()

        return () => {
            if (qrRef.current) {
                qrRef.current.stop().catch(() => { })
            }
        }

    }, [])

    async function startScanner() {

        const qr = qrRef.current

        await qr.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            async (decodedText) => {

                if (!scanning) return

                setScanning(false)

                const parts = decodedText.split("/")
                const code = parts[parts.length - 1]

                const { data } = await supabase
                    .from("tickets")
                    .update({ used: true, used_at: new Date() })
                    .eq("code", code)
                    .eq("used", false)
                    .select()

                if (!data || data.length === 0) {
                    setResult("invalid")
                } else {
                    setResult("valid")
                }

                setTimeout(() => {
                    setResult(null)
                    setScanning(true)
                }, 1800)

            },
            () => { }
        )
    }

    return (
        <div className="scan-wrapper">

            <h1 className="scan-title">Escanear Entrada</h1>

            <div id="reader" style={{ width: "90%", maxWidth: "400px" }}></div>

            {result === "valid" && (
                <div className="overlay valid">
                    ENTRADA VÁLIDA
                    <div className="overlay-subtext">
                        Bienvenido a Essnce
                    </div>
                </div>
            )}

            {result === "invalid" && (
                <div className="overlay invalid">
                    ENTRADA INVÁLIDA
                    <div className="overlay-subtext">
                        Ya fue usada o no existe
                    </div>
                </div>
            )}

        </div>
    )
}

export default Scan