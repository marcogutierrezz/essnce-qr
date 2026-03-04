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

        const { data, error } = await query

        if (!error && data) {
            setTickets(data)
        }
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
            alert("La entrada debe estar marcada como pagada")
            return
        }

        const response = await fetch("/api/send-ticket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: ticket.email,
                code: ticket.code,
                name: ticket.buyer_name
            })
        })

        const result = await response.json()

        if (result.success) {
            await supabase
                .from("tickets")
                .update({ assigned: true })
                .eq("id", ticket.id)

            alert("Entrada enviada correctamente")
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
        <div className="page-content">

            <div className="card">
                <h1>Panel Admin</h1>

                <button onClick={exportToExcel}>
                    Exportar Excel
                </button>

                <button onClick={() => setShowUnassigned(!showUnassigned)}>
                    {showUnassigned ? "Ver Todos" : "Ver No Asignados"}
                </button>
            </div>

            <div className="table-wrapper">
                {tickets.map(ticket => (
                    <div key={ticket.id} className="mobile-ticket">

                        <p><strong>Código:</strong> {ticket.code}</p>

                        <input
                            placeholder="Nombre"
                            value={ticket.buyer_name || ""}
                            onChange={(e) =>
                                handleLocalChange(ticket.id, "buyer_name", e.target.value)
                            }
                        />

                        <input
                            placeholder="Correo"
                            value={ticket.email || ""}
                            onChange={(e) =>
                                handleLocalChange(ticket.id, "email", e.target.value)
                            }
                        />

                        <label style={{ marginTop: "10px", display: "block" }}>
                            <input
                                type="checkbox"
                                checked={ticket.paid || false}
                                onChange={(e) =>
                                    handleLocalChange(ticket.id, "paid", e.target.checked)
                                }
                            />
                            {" "}Pagado
                        </label>

                        <select
                            value={ticket.payment_method || ""}
                            onChange={(e) =>
                                handleLocalChange(ticket.id, "payment_method", e.target.value)
                            }
                        >
                            <option value="">Método</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>

                        <button onClick={() => saveTicket(ticket)}>
                            Guardar
                        </button>

                        <button onClick={() => sendEmail(ticket)}>
                            Enviar Entrada
                        </button>

                    </div>
                ))}
            </div>

        </div>
    )
}

export default Admin