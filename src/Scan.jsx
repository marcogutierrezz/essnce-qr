import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { supabase } from "./supabaseClient"

function Scan() {

    const qrRef = useRef(null)
    const [result, setResult] = useState(null)
    const [cooldown, setCooldown] = useState(false)

    useEffect(() => {

        const qr = new Html5Qrcode("reader")
        qrRef.current = qr

        qr.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            async (decodedText) => {

                if (cooldown) return

                setCooldown(true)

                const parts = decodedText.split("/")
                const code = parts[parts.length - 1]

                const { data } = await supabase
                    .from("tickets")
                    .update({ used: true, used_at: new Date() })
                    .eq("code", code)
                    .eq("used", false)
                    .select()

                if (data && data.length > 0) {
                    setResult("valid")
                } else {
                    setResult("invalid")
                }

                // Mostrar resultado 2.5 segundos
                setTimeout(() => {
                    setResult(null)
                    setCooldown(false)
                }, 2500)

            }
        )

        return () => {
            qr.stop().catch(() => { })
        }

    }, [])

    return (
        <div className="scan-wrapper">

            <div id="reader"></div>

            {result && (
                <div className={`scan-overlay ${result}`}>
                    {result === "valid" ? "ENTRADA VÁLIDA" : "ENTRADA INVÁLIDA"}
                </div>
            )}

        </div>
    )
}

export default Scan