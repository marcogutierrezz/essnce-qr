import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

function Admin() {

    const [tickets, setTickets] = useState([])
    const [tab, setTab] = useState("create")
    const [message, setMessage] = useState("")

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

        if (data) setTickets(data)
    }

    const total = tickets.length
    const registered = tickets.filter(t => t.assigned)
    const available = tickets.filter(t => !t.assigned)
    const used = tickets.filter(t => t.used)
    const paid = tickets.filter(t => t.paid)

    async function saveToAvailableTicket() {

        setMessage("")

        const availableTicket = tickets.find(t => !t.assigned)

        if (!availableTicket) {
            setMessage("❌ No hay entradas disponibles")
            return
        }

        const { error } = await supabase
            .from("tickets")
            .update({
                buyer_name: form.buyer_name,
                email: form.email,
                paid: form.paid,
                payment_method: form.payment_method,
                assigned: true
            })
            .eq("id", availableTicket.id)

        if (error) {
            setMessage("❌ Error al guardar")
            return
        }

        setMessage("✅ Guardado correctamente")

        setForm({
            buyer_name: "",
            email: "",
            paid: false,
            payment_method: ""
        })

        fetchTickets()
    }

    async function sendEmailToLastAssigned() {

        const lastAssigned = registered.slice(-1)[0]

        if (!lastAssigned || !lastAssigned.email) {
            setMessage("❌ No hay entrada válida")
            return
        }

        const response = await fetch("/api/send-ticket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: lastAssigned.email,
                code: lastAssigned.code,
                name: lastAssigned.buyer_name
            })
        })

        const result = await response.json()

        if (result.success) {
            setMessage("✅ Correo enviado correctamente")
        } else {
            setMessage("❌ Error al enviar correo")
        }
    }

    return (
        <div className="admin-container">

            <h1>Panel Admin</h1>

            {/* CONTADOR */}
            <div className="stats">

                <div className="stat-card">
                    <h3>{total}</h3>
                    <p>Total</p>
                </div>

                <div className="stat-card green">
                    <h3>{registered.length}</h3>
                    <p>Registradas</p>
                </div>

                <div className="stat-card blue">
                    <h3>{available.length}</h3>
                    <p>Disponibles</p>
                </div>

                <div className="stat-card red">
                    <h3>{used.length}</h3>
                    <p>Usadas</p>
                </div>

                <div className="stat-card yellow">
                    <h3>{paid.length}</h3>
                    <p>Pagadas</p>
                </div>

            </div>

            <div className="tabs">
                <button className={tab === "create" ? "tab active" : "tab"} onClick={() => setTab("create")}>
                    Crear
                </button>
                <button className={tab === "registered" ? "tab active" : "tab"} onClick={() => setTab("registered")}>
                    Registradas
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
                        onChange={(e) =>
                            setForm({ ...form, buyer_name: e.target.value })
                        }
                    />

                    <input
                        placeholder="Correo"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={form.paid}
                            onChange={(e) =>
                                setForm({ ...form, paid: e.target.checked })
                            }
                        />
                        Pagado
                    </label>

                    <select
                        value={form.payment_method}
                        onChange={(e) =>
                            setForm({ ...form, payment_method: e.target.value })
                        }
                    >
                        <option value="">Método</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia</option>
                    </select>

                    <button onClick={saveToAvailableTicket}>
                        Guardar
                    </button>

                    <button onClick={sendEmailToLastAssigned}>
                        Enviar Correo
                    </button>

                    {message && <p className="message">{message}</p>}

                </div>
            )}

            {tab === "registered" && (
                registered.map(ticket => (
                    <div key={ticket.id} className="ticket-card">
                        <div className="ticket-code">{ticket.code}</div>
                        <p>{ticket.buyer_name}</p>
                        <p>{ticket.email}</p>
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