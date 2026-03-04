import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

function Admin() {

    const [tickets, setTickets] = useState([])
    const [tab, setTab] = useState("pending")

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

    async function createTicket() {

        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()

        await supabase.from("tickets").insert([
            {
                code: randomCode,
                used: false,
                paid: false,
                assigned: false
            }
        ])

        fetchTickets()
    }

    function handleChange(id, field, value) {
        setTickets(prev =>
            prev.map(ticket =>
                ticket.id === id ? { ...ticket, [field]: value } : ticket
            )
        )
    }

    async function save(ticket) {
        await supabase
            .from("tickets")
            .update(ticket)
            .eq("id", ticket.id)

        fetchTickets()
    }

    const filtered =
        tab === "pending"
            ? tickets.filter(t => !t.assigned)
            : tickets.filter(t => t.assigned)

    return (
        <div className="admin-container">

            <div className="admin-top">
                <h1>Panel Admin</h1>
                <button onClick={createTicket}>+ Nueva Entrada</button>
            </div>

            <div className="tabs">
                <button
                    className={tab === "pending" ? "tab active" : "tab"}
                    onClick={() => setTab("pending")}
                >
                    Pendientes
                </button>

                <button
                    className={tab === "assigned" ? "tab active" : "tab"}
                    onClick={() => setTab("assigned")}
                >
                    Asignadas
                </button>
            </div>

            {filtered.map(ticket => (
                <div key={ticket.id} className="ticket-card">

                    <div className="ticket-code">{ticket.code}</div>

                    <input
                        placeholder="Nombre"
                        value={ticket.buyer_name || ""}
                        onChange={(e) =>
                            handleChange(ticket.id, "buyer_name", e.target.value)
                        }
                    />

                    <input
                        placeholder="Correo"
                        value={ticket.email || ""}
                        onChange={(e) =>
                            handleChange(ticket.id, "email", e.target.value)
                        }
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={ticket.paid || false}
                            onChange={(e) =>
                                handleChange(ticket.id, "paid", e.target.checked)
                            }
                        />
                        Pagado
                    </label>

                    <button onClick={() => save(ticket)}>
                        Guardar
                    </button>

                </div>
            ))}

        </div>
    )
}

export default Admin