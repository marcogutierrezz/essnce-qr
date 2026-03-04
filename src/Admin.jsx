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
            .order("created_at", { ascending: true })

        if (data) setTickets(data)
    }

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

        await fetchTickets()

        setForm({
            buyer_name: "",
            email: "",
            paid: false,
            payment_method: ""
        })
    }

    async function sendEmailToLastAssigned() {

        const lastAssigned = tickets
            .filter(t => t.assigned)
            .slice(-1)[0]

        if (!lastAssigned || !lastAssigned.email) {
            setMessage("❌ No hay entrada válida para enviar")
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

    const registered = tickets.filter(t => t.assigned)
    const available = tickets.filter(t => !t.assigned)

    return (
        <div className="admin-container">

            <h1>Panel Admin</h1>

            <div className="tabs">
                <button
                    className={tab === "create" ? "tab active" : "tab"}
                    onClick={() => setTab("create")}
                >
                    Crear
                </button>

                <button
                    className={tab === "registered" ? "tab active" : "tab"}
                    onClick={() => setTab("registered")}
                >
                    Registrados
                </button>

                <button
                    className={tab === "available" ? "tab active" : "tab"}
                    onClick={() => setTab("available")}
                >
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

                    {message && (
                        <p style={{ marginTop: "10px" }}>{message}</p>
                    )}

                </div>
            )}

            {tab === "registered" && (
                registered.map(ticket => (
                    <div key={ticket.id} className="ticket-card">
                        <div className="ticket-code">{ticket.code}</div>
                        <p>{ticket.buyer_name}</p>
                        <p>{ticket.email}</p>
                        <p>{ticket.paid ? "Pagado" : "Pendiente"}</p>
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