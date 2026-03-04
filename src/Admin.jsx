import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

function Admin() {

    const [tickets, setTickets] = useState([])
    const [tab, setTab] = useState("create")
    const [form, setForm] = useState({
        buyer_name: "",
        email: "",
        paid: false,
        payment_method: ""
    })

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

        const { data } = await supabase.from("tickets").insert([
            {
                code: randomCode,
                buyer_name: form.buyer_name,
                email: form.email,
                paid: form.paid,
                payment_method: form.payment_method,
                assigned: true,
                used: false
            }
        ]).select()

        if (data) {
            setForm({
                buyer_name: "",
                email: "",
                paid: false,
                payment_method: ""
            })
            fetchTickets()
            alert("Entrada creada")
        }
    }

    async function sendEmail(ticket) {

        if (!ticket.email) {
            alert("No tiene correo")
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

        alert("Correo enviado")
    }

    const registered = tickets.filter(t => t.assigned)
    const available = tickets.filter(t => !t.assigned)

    return (
        <div className="admin-container">

            <h1>Panel Admin</h1>

            <div className="tabs">
                <button className={tab === "create" ? "tab active" : "tab"} onClick={() => setTab("create")}>
                    Crear
                </button>
                <button className={tab === "registered" ? "tab active" : "tab"} onClick={() => setTab("registered")}>
                    Registrados
                </button>
                <button className={tab === "available" ? "tab active" : "tab"} onClick={() => setTab("available")}>
                    Disponibles
                </button>
            </div>

            {tab === "create" && (
                <div className="ticket-card">

                    <input
                        placeholder="Nombre"
                        value={form.buyer_name}
                        onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
                    />

                    <input
                        placeholder="Correo"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={form.paid}
                            onChange={(e) => setForm({ ...form, paid: e.target.checked })}
                        />
                        Pagado
                    </label>

                    <select
                        value={form.payment_method}
                        onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                    >
                        <option value="">Método</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia</option>
                    </select>

                    <button onClick={createTicket}>
                        Guardar Entrada
                    </button>

                </div>
            )}

            {tab === "registered" && (
                registered.map(ticket => (
                    <div key={ticket.id} className="ticket-card">
                        <div className="ticket-code">{ticket.code}</div>
                        <p>{ticket.buyer_name}</p>
                        <p>{ticket.email}</p>
                        <p>{ticket.paid ? "Pagado" : "Pendiente"}</p>
                        <button onClick={() => sendEmail(ticket)}>Reenviar</button>
                    </div>
                ))
            )}

            {tab === "available" && (
                available.map(ticket => (
                    <div key={ticket.id} className="ticket-card">
                        <div className="ticket-code">{ticket.code}</div>
                        <p>Disponible</p>
                    </div>
                ))
            )}

        </div>
    )
}

export default Admin