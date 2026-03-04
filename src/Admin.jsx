import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

function Admin() {

    const [tickets, setTickets] = useState([])

    useEffect(() => {
        fetchTickets()
    }, [])

    async function fetchTickets() {
        const { data, error } = await supabase
            .from("tickets")
            .select("*")

        if (!error) {
            setTickets(data)
        }
    }

    function exportToExcel() {
        const worksheet = XLSX.utils.json_to_sheet(tickets)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets")

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        })

        const data = new Blob([excelBuffer], {
            type: "application/octet-stream"
        })

        saveAs(data, "essnce_tickets.xlsx")
    }

    return (
        <div style={{ padding: "40px" }}>
            <h1>Panel Admin Essnce</h1>

            <button onClick={exportToExcel}>
                Exportar a Excel
            </button>

            <table border="1" cellPadding="10" style={{ marginTop: "20px" }}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Código</th>
                        <th>Pagado</th>
                        <th>Método</th>
                        <th>Usado</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticket => (
                        <tr key={ticket.id}>
                            <td>{ticket.buyer_name}</td>
                            <td>{ticket.code}</td>
                            <td>{ticket.paid ? "Sí" : "No"}</td>
                            <td>{ticket.payment_method}</td>
                            <td>{ticket.used ? "Sí" : "No"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Admin