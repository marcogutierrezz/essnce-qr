import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { supabase } from "./supabaseClient"

function Scan() {

    const scannerRef = useRef(null)
    const [message, setMessage] = useState(null)
    const [status, setStatus] = useState(null)
    const [scanning, setScanning] = useState(true)

    useEffect(() => {

        const scanner = new Html5Qrcode("reader")
        scannerRef.current = scanner

        startScanner()

        return () => {
            scanner.stop().catch(() => { })
        }

    }, [])

    async function startScanner() {

        const scanner = scannerRef.current

        await scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            onScanSuccess
        )

    }

    async function onScanSuccess(decodedText) {

        if (!scanning) return

        setScanning(false)

        const scanner = scannerRef.current
        await scanner.pause()

        try {

            const code = decodedText.split("ticket=")[1]

            const { data } = await supabase
                .from("tickets")
                .select("*")
                .eq("code", code)
                .single()

            if (!data) {

                setStatus("invalid")
                setMessage("Ticket inválido")

            } else if (data.used) {

                setStatus("invalid")
                setMessage("Ticket ya usado")

            } else {

                await supabase
                    .from("tickets")
                    .update({ used: true })
                    .eq("id", data.id)

                setStatus("valid")
                setMessage("Bienvenido a ESSNCE")

            }

        } catch (err) {

            setStatus("invalid")
            setMessage("Error al validar")

        }

        setTimeout(async () => {

            setMessage(null)
            setStatus(null)

            const scanner = scannerRef.current
            await scanner.resume()

            setScanning(true)

        }, 2500)

    }

    return (
        <div className="scan-wrapper">

            <div id="reader"></div>

            {message && (
                <div className={`scan-overlay ${status}`}>
                    {message}
                </div>
            )}

        </div>
    )
}

export default Scan