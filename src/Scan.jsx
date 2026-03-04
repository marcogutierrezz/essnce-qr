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
                }, 2000)

            },
            () => { }
        )
    }

    return (
        <div style={{ position: "relative" }}>

            <div id="reader" style={{ width: "100%" }}></div>

            {result === "valid" && (
                <div style={overlayValid}>
                    ENTRADA VÁLIDA
                </div>
            )}

            {result === "invalid" && (
                <div style={overlayInvalid}>
                    ENTRADA INVÁLIDA O YA USADA
                </div>
            )}

        </div>
    )
}

const overlayValid = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "#00e676",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "40px",
    fontWeight: "bold",
    zIndex: 9999
}

const overlayInvalid = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "#ff1744",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "40px",
    fontWeight: "bold",
    zIndex: 9999
}

export default Scan