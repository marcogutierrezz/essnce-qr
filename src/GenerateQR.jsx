import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"
import QRCode from "qrcode"

function GenerateQR() {

    const [tickets, setTickets] = useState([])

    useEffect(() => {
        fetchTickets()
    }, [])

    async function fetchTickets() {
        const { data } = await supabase
            .from("tickets")
            .select("*")

        setTickets(data)
    }

    async function generateQR(code) {
        const url = `https://essnce-qr.vercel.app/validate/${code}`
        return await QRCode.toDataURL(url)
    }

    async function downloadAll() {
        for (const ticket of tickets) {
            const qrImage = await generateQR(ticket.code)

            const link = document.createElement("a")
            link.href = qrImage
            link.download = `${ticket.code}.png`
            link.click()
        }
    }

    return (
        <div style={{ padding: "40px" }}>
            <h1>Generador QR Final</h1>
            <button onClick={downloadAll}>
                Descargar Todos los QR
            </button>
        </div>
    )
}

export default GenerateQR