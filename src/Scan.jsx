import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { supabase } from "./supabaseClient"

function Scan() {

    const qrRef = useRef(null)
    const [result, setResult] = useState(null)
    const [scanning, setScanning] = useState(true)

    useEffect(() => {

        const qr = new Html5Qrcode("reader")
        qrRef.current = qr

        startScanner()

        return () => {
            stopScanner()
        }

    }, [])

    async function startScanner() {

        const qr = qrRef.current

        await qr.start(
            { facingMode: "environment" },
            { fps: 8, qrbox: 250 },
            async (decodedText) => {

                if (!scanning) return

                setScanning(false)

                const parts = decodedText.split("/")
                const code = parts[parts.length - 1]

                await stopScanner()

                const { data } = await supabase
                    .from("tickets")
                    .update({ used: true })
                    .eq("code", code)
                    .eq("used", false)
                    .select()

                setResult(data && data.length > 0 ? "valid" : "invalid")
            }
        )
    }

    async function stopScanner() {
        try {
            await qrRef.current.stop()
        } catch { }
    }

    async function scanAgain() {
        setResult(null)
        setScanning(true)
        startScanner()
    }

    return (
        <div className="scan-container">

            <div id="reader"></div>

            {result && (
                <div className={`scan-overlay ${result}`}>
                    <h1>
                        {result === "valid" ? "ENTRADA VÁLIDA" : "ENTRADA INVÁLIDA"}
                    </h1>
                    <button onClick={scanAgain}>
                        Escanear otra
                    </button>
                </div>
            )}

        </div>
    )
}

export default Scan