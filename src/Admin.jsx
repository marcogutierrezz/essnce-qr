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
            .order("created_at", { ascending: true })

        if (!error) {
            setTickets(data)
        }
    }

    async function updateTicket(id, field, value) {
        await supabase
            .from("tickets")
            .update({ [field]: value })
            .eq("id", id)

        fetchTickets()
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
        <div className="container">
            <div className="card">
                <h1>Panel Admin Essnce</h1>

                <button onClick={exportToExcel}>
                    Exportar a Excel
                </button>

                <table>
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
                                <td>
                                    <input
                                        value={ticket.buyer_name || ""}
                                        onChange={(e) =>
                                            updateTicket(ticket.id, "buyer_name", e.target.value)
                                        }
                                    />
                                </td>

                                <td>{ticket.code}</td>

                                <td>
                                    <input
                                        type="checkbox"
                                        checked={ticket.paid || false}
                                        onChange={(e) =>
                                            updateTicket(ticket.id, "paid", e.target.checked)
                                        }
                                    />
                                </td>

                                <td>
                                    <select
                                        value={ticket.payment_method || ""}
                                        onChange={(e) =>
                                            updateTicket(ticket.id, "payment_method", e.target.value)
                                        }
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Transferencia">Transferencia</option>
                                    </select>
                                </td>

                                <td>{ticket.used ? "Sí" : "No"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}

export default Admin