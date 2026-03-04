import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

function Admin() {

    const [tickets, setTickets] = useState([])

    useEffect(() => {
        fetchTickets()
    }, [])

    async function fetchTickets() {
        const { data } = await supabase
            .from("tickets")
            .select("*")
            .order("created_at", { ascending: true })

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

        alert("Guardado")
    }

    async function sendEmail(ticket) {

        if (!ticket.email) {
            alert("Agrega correo")
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

    return (
        <div className="container">

            <div className="card">
                <h1>Panel Admin</h1>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Código</th>
                        <th>Pagado</th>
                        <th>Método</th>
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
    )
}

export default Admin