import { useEffect, useState, useRef } from "react"
import { supabase } from "./supabaseClient"

function Admin() {

    const [tickets, setTickets] = useState([])
    const [expenses, setExpenses] = useState([])
    const [tab, setTab] = useState("create")
    const [message, setMessage] = useState("")
    const [editingTicket, setEditingTicket] = useState(null)

    const dragItem = useRef(null)
    const startX = useRef(0)

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
        const { data } = await supabase.from("tickets").select("*")
        if (data) setTickets(data)
    }

    async function fetchExpenses() {
        const { data } = await supabase
            .from("expenses")
            .select("*")
            .order("created_at", { ascending: false })

        if (data) setExpenses(data)
    }

    const registered = tickets.filter(t => t.assigned)
    const available = tickets.filter(t => !t.assigned)

    const cashTotal = tickets
        .filter(t => t.paid && t.payment_method === "Efectivo")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    const transferTotal = tickets
        .filter(t => t.paid && t.payment_method === "Transferencia")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
    const finalCash = cashTotal - expenseTotal

    /* ---------------------------
       CREAR + ENVIAR ENTRADA
    ----------------------------*/

    async function saveToAvailableTicket() {

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
            setMessage("❌ Error guardando")
            return
        }

        if (form.email) {

            await fetch("/api/send-ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    code: availableTicket.code,
                    name: form.buyer_name
                })
            })

        }

        setForm({
            buyer_name: "",
            email: "",
            paid: false,
            payment_method: "",
            amount: ""
        })

        setMessage("✅ Entrada creada y enviada")
        fetchTickets()
    }

    /* ---------------------------
       SWIPE LOGIC
    ----------------------------*/

    function startDrag(e, ticket) {

        dragItem.current = ticket
        startX.current = e.touches ? e.touches[0].clientX : e.clientX

    }

    function onDrag(e, ticket) {

        if (!dragItem.current) return

        const x = e.touches ? e.touches[0].clientX : e.clientX
        const diff = x - startX.current

        e.currentTarget.style.transform = `translateX(${diff}px)`

    }

    function endDrag(e, ticket) {

        if (!dragItem.current) return

        const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
        const diff = x - startX.current

        e.currentTarget.style.transform = `translateX(0px)`

        if (diff > 120) {
            confirmDelete(ticket)
        }

        if (diff < -120) {
            setEditingTicket(ticket)
        }

        dragItem.current = null
    }

    /* ---------------------------
       BORRAR
    ----------------------------*/

    async function confirmDelete(ticket) {

        const confirmAction = confirm("¿Seguro que quieres borrar esta entrada?")

        if (!confirmAction) return

        await supabase
            .from("tickets")
            .update({
                buyer_name: null,
                email: null,
                payment_method: null,
                amount: 0,
                paid: false,
                assigned: false
            })
            .eq("id", ticket.id)

        fetchTickets()
    }

    /* ---------------------------
       EDITAR
    ----------------------------*/

    async function updateTicket() {

        await supabase
            .from("tickets")
            .update({
                buyer_name: editingTicket.buyer_name,
                email: editingTicket.email,
                amount: editingTicket.amount,
                payment_method: editingTicket.payment_method
            })
            .eq("id", editingTicket.id)

        setEditingTicket(null)
        fetchTickets()
    }

    async function resendTicket(ticket) {

        await fetch("/api/send-ticket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: ticket.email,
                code: ticket.code,
                name: ticket.buyer_name
            })
        })

        setMessage("✅ Entrada reenviada")
    }

    /* ---------------------------
       GASTOS
    ----------------------------*/

    async function addExpense() {

        await supabase.from("expenses").insert([expenseForm])

        setExpenseForm({
            admin_name: "",
            description: "",
            amount: ""
        })

        fetchExpenses()
    }

    return (

        <div className="admin-container">

            <h1>Panel Admin</h1>

            {/* CONTADORES */}

            <div className="stats">

                <div className="stat-card">
                    <h3>${cashTotal}</h3>
                    <p>Efectivo</p>
                </div>

                <div className="stat-card">
                    <h3>${transferTotal}</h3>
                    <p>Transferencias</p>
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

            {/* TABS */}

            <div className="tabs">

                <button onClick={() => setTab("create")}>Crear</button>
                <button onClick={() => setTab("registered")}>Registradas</button>
                <button onClick={() => setTab("available")}>Disponibles</button>
                <button onClick={() => setTab("expenses")}>Gastos</button>

            </div>

            {/* CREATE */}

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
                        placeholder="Monto"
                        type="number"
                        value={form.amount}
                        onChange={(e) =>
                            setForm({ ...form, amount: e.target.value })
                        }
                    />

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

                    <button
                        className="btn-primary"
                        onClick={saveToAvailableTicket}
                    >
                        Guardar y enviar entrada
                    </button>

                </div>

            )}

            {/* REGISTERED */}

            {tab === "registered" && (

                registered.map(ticket => (

                    <div
                        key={ticket.id}
                        className="ticket-card swipe-card"

                        onMouseDown={(e) => startDrag(e, ticket)}
                        onMouseMove={(e) => onDrag(e, ticket)}
                        onMouseUp={(e) => endDrag(e, ticket)}

                        onTouchStart={(e) => startDrag(e, ticket)}
                        onTouchMove={(e) => onDrag(e, ticket)}
                        onTouchEnd={(e) => endDrag(e, ticket)}
                    >

                        <div className="ticket-code">{ticket.code}</div>
                        <p>{ticket.buyer_name}</p>
                        <p>{ticket.email}</p>
                        <p>${ticket.amount}</p>

                        <small>← editar | borrar →</small>

                    </div>

                ))

            )}

            {/* EDIT */}

            {editingTicket && (

                <div className="ticket-card">

                    <h3>Editar entrada</h3>

                    <input
                        value={editingTicket.buyer_name}
                        onChange={(e) =>
                            setEditingTicket({ ...editingTicket, buyer_name: e.target.value })
                        }
                    />

                    <input
                        value={editingTicket.email}
                        onChange={(e) =>
                            setEditingTicket({ ...editingTicket, email: e.target.value })
                        }
                    />

                    <input
                        type="number"
                        value={editingTicket.amount}
                        onChange={(e) =>
                            setEditingTicket({ ...editingTicket, amount: e.target.value })
                        }
                    />

                    <button onClick={updateTicket}>
                        Guardar cambios
                    </button>

                    <button onClick={() => resendTicket(editingTicket)}>
                        Enviar entrada de nuevo
                    </button>

                    <button onClick={() => setEditingTicket(null)}>
                        Cancelar
                    </button>

                </div>

            )}

        </div>

    )
}

export default Admin