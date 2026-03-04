import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

function Admin() {

    const [tickets, setTickets] = useState([])
    const [showUnassigned, setShowUnassigned] = useState(false)

    useEffect(() => {
        fetchTickets()
    }, [showUnassigned])

    async function fetchTickets() {
        let query = supabase
            .from("tickets")
            .select("*")
            .order("created_at", { ascending: true })

        if (showUnassigned) {
            query = query.eq("assigned", false)
        }

        const { data } = await query
        setTickets(data)
    }

    async function updateTicket(id, field, value) {
        await supabase
            .from("tickets")
            .update({ [field]: value })
            .eq("id", id)

        fetchTickets()
    }

    async function sendEmail(ticket) {

        if (!ticket.email) {
            alert("Debes agregar un correo primero")
            return
        }

        if (!ticket.paid) {
            alert("La entrada debe estar marcada como pagada")
            return
        }

        const response = await fetch("/api/send-ticket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: ticket.email,
                code: ticket.code,
                name: ticket.buyer_name
            })
        })

        const result = await response.json()

        if (result.success) {
            alert("Entrada enviada correctamente")

            await supabase
                .from("tickets")
                .update({ assigned: true })
                .eq("id", ticket.id)

            fetchTickets()
        } else {
            alert("Error al enviar correo")
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
        <div className="container">
            <div className="card">
                <h1>Panel Admin Essnce</h1>

                <div style={{ marginBottom: "20px", display: "flex", gap: "15px" }}>
                    <button onClick={exportToExcel}>
                        Exportar Excel
                    </button>

                    <button onClick={() => setShowUnassigned(!showUnassigned)}>
                        {showUnassigned ? "Ver Todos" : "Ver No Asignados"}
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Código</th>
                            <th>Pagado</th>
                            <th>Método</th>
                            <th>Usado</th>
                            <th>Enviar</th>
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

                                <td>
                                    <input
                                        value={ticket.email || ""}
                                        onChange={(e) =>
                                            updateTicket(ticket.id, "email", e.target.value)
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

                                <td>
                                    <button onClick={() => sendEmail(ticket)}>
                                        Enviar Entrada
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}

export default Admin