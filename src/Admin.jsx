import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

function Admin() {

    const [tickets, setTickets] = useState([])
    const [expenses, setExpenses] = useState([])

    const [tab, setTab] = useState("create")
    const [message, setMessage] = useState("")

    const [form, setForm] = useState({
        buyer_name: "",
        email: "",
        paid: false,
        payment_method: "",
        amount: ""
    })

    const [expenseForm, setExpenseForm] = useState({
        admin_name: "",
        description: "",
        amount: ""
    })

    useEffect(() => {
        fetchTickets()
        fetchExpenses()
    }, [])

    async function fetchTickets() {
        const { data } = await supabase
            .from("tickets")
            .select("*")

        if (data) setTickets(data)
    }

    async function fetchExpenses() {
        const { data } = await supabase
            .from("expenses")
            .select("*")
            .order("created_at", { ascending: false })

        if (data) setExpenses(data)
    }

    const total = tickets.length
    const registered = tickets.filter(t => t.assigned)
    const available = tickets.filter(t => !t.assigned)
    const used = tickets.filter(t => t.used)
    const paid = tickets.filter(t => t.paid)

    const cashTotal = tickets
        .filter(t => t.paid && t.payment_method === "Efectivo")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    const transferTotal = tickets
        .filter(t => t.paid && t.payment_method === "Transferencia")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)

    const finalCash = cashTotal - expenseTotal

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
                amount: form.amount,
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
            payment_method: "",
            amount: ""
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

    async function addExpense() {

        const { error } = await supabase
            .from("expenses")
            .insert([expenseForm])

        if (error) {
            setMessage("❌ Error al guardar gasto")
            return
        }

        setExpenseForm({
            admin_name: "",
            description: "",
            amount: ""
        })

        fetchExpenses()
        setMessage("✅ Gasto registrado")
    }

    return (
        <div className="admin-container">

            <h1>Panel Admin</h1>

            {/* CONTADORES */}
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

                <div className="stat-card">
                    <h3>${cashTotal}</h3>
                    <p>Efectivo esperado</p>
                </div>

                <div className="stat-card">
                    <h3>${transferTotal}</h3>
                    <p>Transferencia</p>
                </div>

                <div className="stat-card">
                    <h3>${expenseTotal}</h3>
                    <p>Gastos</p>
                </div>

                <div className="stat-card green">
                    <h3>${finalCash}</h3>
                    <p>Caja final</p>
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

                <button className={tab === "expenses" ? "tab active" : "tab"} onClick={() => setTab("expenses")}>
                    Gastos
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

                    <input
                        placeholder="Monto pagado"
                        type="number"
                        value={form.amount}
                        onChange={(e) =>
                            setForm({ ...form, amount: e.target.value })
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

                    <button className="btn-primary" onClick={saveToAvailableTicket}>
                        Guardar
                    </button>

                    <button className="btn-secondary" onClick={sendEmailToLastAssigned}>
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
                        <p>${ticket.amount}</p>
                        <p>{ticket.payment_method}</p>
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

            {tab === "expenses" && (
                <div>

                    <div className="ticket-card">

                        <input
                            placeholder="Nombre admin"
                            value={expenseForm.admin_name}
                            onChange={(e) =>
                                setExpenseForm({ ...expenseForm, admin_name: e.target.value })
                            }
                        />

                        <input
                            placeholder="Descripción"
                            value={expenseForm.description}
                            onChange={(e) =>
                                setExpenseForm({ ...expenseForm, description: e.target.value })
                            }
                        />

                        <input
                            type="number"
                            placeholder="Monto"
                            value={expenseForm.amount}
                            onChange={(e) =>
                                setExpenseForm({ ...expenseForm, amount: e.target.value })
                            }
                        />

                        <button className="btn-primary" onClick={addExpense}>
                            Registrar gasto
                        </button>

                    </div>

                    {expenses.map(exp => (
                        <div key={exp.id} className="ticket-card">
                            <p><strong>{exp.admin_name}</strong></p>
                            <p>{exp.description}</p>
                            <p>${exp.amount}</p>
                        </div>
                    ))}

                </div>
            )}

        </div>
    )
}

export default Admin