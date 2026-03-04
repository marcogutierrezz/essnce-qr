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
        if (data) setTickets(data)
    }

    function handleLocalChange(id, field, value) {
        setTickets(prev =>
            prev.map(ticket =>
                ticket.id === id ? { ...ticket, [field]: value } : ticket
            )
        )
    }

    async function saveTicket(ticket) {
        await supabase
            .from("tickets")
            .update({
                buyer_name: ticket.buyer_name,
                email: ticket.email,
                paid: ticket.paid,
                payment_method: ticket.payment_method
            })
            .eq("id", ticket.id)

        alert("Guardado correctamente")
    }

    async function sendEmail(ticket) {

        if (!ticket.email) {
            alert("Debes agregar un correo primero")
            return
        }

        if (!ticket.paid) {
            alert("Marca como pagado primero")
            return
        }

        await fetch("/api/send-ticket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: ticket.email,
                code: ticket.code,
                name: ticket.buyer_name
            })
        })

        alert("Entrada enviada")
    }

    // 🔥 ESTA ES LA FUNCIÓN QUE FALTABA
    function exportToExcel() {

        const dataToExport = tickets.map(ticket => ({
            Nombre: ticket.buyer_name,
            Email: ticket.email,
            Codigo: ticket.code,
            Pagado: ticket.paid ? "Sí" : "No",
            Metodo: ticket.payment_method,
            Usado: ticket.used ? "Sí" : "No"
        }))

        const worksheet = XLSX.utils.json_to_sheet(dataToExport)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets")

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        })

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        })

        saveAs(blob, "essnce_tickets.xlsx")
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
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id}>

                                <td>
                                    <input
                                        value={ticket.buyer_name || ""}
                                        onChange={(e) =>
                                            handleLocalChange(ticket.id, "buyer_name", e.target.value)
                                        }
                                    />
                                </td>

                                <td>
                                    <input
                                        value={ticket.email || ""}
                                        onChange={(e) =>
                                            handleLocalChange(ticket.id, "email", e.target.value)
                                        }
                                    />
                                </td>

                                <td>{ticket.code}</td>

                                <td>
                                    <input
                                        type="checkbox"
                                        checked={ticket.paid || false}
                                        onChange={(e) =>
                                            handleLocalChange(ticket.id, "paid", e.target.checked)
                                        }
                                    />
                                </td>

                                <td>
                                    <select
                                        value={ticket.payment_method || ""}
                                        onChange={(e) =>
                                            handleLocalChange(ticket.id, "payment_method", e.target.value)
                                        }
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Transferencia">Transferencia</option>
                                    </select>
                                </td>

                                <td>{ticket.used ? "Sí" : "No"}</td>

                                <td>
                                    <button onClick={() => saveTicket(ticket)}>
                                        Guardar
                                    </button>

                                    <button onClick={() => sendEmail(ticket)}>
                                        Enviar
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