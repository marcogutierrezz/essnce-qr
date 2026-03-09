import { useEffect, useState, useRef } from "react"
import { supabase } from "./supabaseClient"
import jsPDF from "jspdf"
import QRCode from "qrcode"
import JSZip from "jszip"
import { saveAs } from "file-saver"

function Admin() {

    const [tickets, setTickets] = useState([])
    const [expenses, setExpenses] = useState([])
    const [tab, setTab] = useState("create")
    const [message, setMessage] = useState("")
    const [editingTicket, setEditingTicket] = useState(null)
    const [search, setSearch] = useState("")

    const [lastGeneratedQty, setLastGeneratedQty] = useState(0)

    const startX = useRef(null)
    const dragging = useRef(false)

    const [form, setForm] = useState({
        buyer_name: "",
        paid: false,
        payment_method: "",
        amount: "",
        quantity: 1
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

    const filteredRegistered = registered.filter(ticket =>

        (ticket.buyer_name || "").toLowerCase().includes(search.toLowerCase())
    )

    const groupedTickets = Object.values(
        filteredRegistered.reduce((acc, ticket) => {
            const key = ticket.batch_id || ticket.id

            if (!acc[key]) acc[key] = []

            acc[key].push(ticket)

            return acc
        }, {})
    )

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


    /* ---------------------------
       SWIPE SYSTEM
    ----------------------------*/

    function handleStart(e) {
        dragging.current = true
        startX.current = e.touches ? e.touches[0].clientX : e.clientX
    }

    function handleMove(e) {

        if (!dragging.current) return

        const x = e.touches ? e.touches[0].clientX : e.clientX
        const diff = x - startX.current

        e.currentTarget.style.transform = `translateX(${diff}px)`

        if (diff > 50) {
            e.currentTarget.classList.add("swipe-delete")
        } else {
            e.currentTarget.classList.remove("swipe-delete")
        }
    }

    function handleEnd(e, group) {

        if (!dragging.current) return

        const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
        const diff = x - startX.current

        e.currentTarget.style.transform = "translateX(0px)"
        dragging.current = false

        if (diff > 120) deleteGroup(group)

    }


    /* ---------------------------
       DELETE
    ----------------------------*/

    async function deleteTicket(ticket) {

        const confirmDelete = confirm("¿Seguro que quieres borrar esta entrada?")

        if (!confirmDelete) return

        await supabase
            .from("tickets")
            .update({
                buyer_name: null,
                paid: false,
                payment_method: null,
                amount: 0,
                assigned: false
            })
            .eq("id", ticket.id)

        fetchTickets()
    }

    async function deleteGroup(group) {

        const confirmDelete = confirm("¿Seguro que quieres borrar estas entradas?")

        if (!confirmDelete) return

        for (let ticket of group) {

            await supabase
                .from("tickets")
                .update({
                    buyer_name: null,
                    paid: false,
                    payment_method: null,
                    amount: 0,
                    assigned: false,
                    batch_id: null,
                    whatsapp_sent: false
                })
                .eq("id", ticket.id)

        }

        fetchTickets()
    }


    /* ---------------------------
       CREATE + SEND EMAIL
    ----------------------------*/

    async function saveToAvailableTicket() {

        setMessage("")

        const qty = form.quantity || 1
        setLastGeneratedQty(qty)
        const batchId = Date.now().toString()

        const availableTickets = tickets.filter(t => !t.assigned).slice(0, qty)

        if (availableTickets.length < qty) {
            setMessage("❌ No hay suficientes entradas disponibles")
            return
        }

        for (let ticket of availableTickets) {

            const { error } = await supabase
                .from("tickets")
                .update({
                    buyer_name: form.buyer_name,
                    paid: form.paid,
                    payment_method: form.payment_method,
                    amount: form.amount,
                    assigned: true,
                    batch_id: batchId
                })
                .eq("id", ticket.id)

            if (!error) {

            }
        }

        setForm({
            buyer_name: "",
            paid: false,
            payment_method: "",
            amount: "",
            quantity: 1
        })

        setMessage(`✅ ${qty} entradas generadas`)

        fetchTickets()
    }

    async function downloadGeneratedTickets() {

        const generated = tickets
            .filter(t => t.assigned && !t.used)
            .slice(-lastGeneratedQty)

        if (generated.length === 0) return

        if (generated.length === 1) {

            const pdfBlob = await generateTicketPDF(generated[0])
            saveAs(pdfBlob, `ticket-${generated[0].ticket_number}.pdf`)
            return
        }

        const zip = new JSZip()

        for (let ticket of generated) {

            const pdfBlob = await generateTicketPDF(ticket)

            zip.file(`ticket-${ticket.ticket_number}.pdf`, pdfBlob)
        }

        const zipFile = await zip.generateAsync({ type: "blob" })

        saveAs(zipFile, "tickets.zip")
    }


    /* ---------------------------
       EXPENSES
    ----------------------------*/

    async function addExpense() {

        await supabase
            .from("expenses")
            .insert([expenseForm])

        setExpenseForm({
            admin_name: "",
            description: "",
            amount: ""
        })

        fetchExpenses()
    }

    /* ---------------------------
   GENERAR PDF
----------------------------*/

    async function generateTicketPDF(ticket) {

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: [540, 960]
        })

        const ticketNumber = ticket.ticket_number

        const img = new Image()
        img.src = "/ticket-template.jpg"

        await new Promise((resolve) => {
            img.onload = resolve
        })

        pdf.addImage(img, "JPEG", 0, 0, 540, 960)

        pdf.setFontSize(28)
        pdf.setTextColor(0, 0, 0)
        pdf.text(`#${ticketNumber}`, 270, 120, { align: "center" })

        const qrData = await QRCode.toDataURL(
            `${window.location.origin}/validate/${ticket.code}`
        )

        const qrSize = 220
        const x = (540 / 2) - (qrSize / 2)
        const y = 158

        pdf.addImage(qrData, "PNG", x, y, qrSize, qrSize)

        return pdf.output("blob")
    }



    return (

        <div className="admin-container">

            <h1>Panel Admin</h1>

            {message && <p className="message">{message}</p>}

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


            {/* TABS */}

            <div className="tabs">

                <button className={tab === "create" ? "tab active" : "tab"} onClick={() => setTab("create")}>Crear</button>
                <button className={tab === "registered" ? "tab active" : "tab"} onClick={() => setTab("registered")}>Registradas</button>
                <button className={tab === "available" ? "tab active" : "tab"} onClick={() => setTab("available")}>Disponibles</button>
                <button className={tab === "expenses" ? "tab active" : "tab"} onClick={() => setTab("expenses")}>Gastos</button>

            </div>


            {/* CREATE */}

            {tab === "create" && (

                <div className="ticket-card">

                    <input placeholder="Nombre"
                        value={form.buyer_name}
                        onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
                    />

                    <input type="number" placeholder="Monto pagado"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />

                    <input
                        type="number"
                        min="1"
                        max="50"
                        placeholder="Cantidad de entradas"
                        value={form.quantity}
                        onChange={(e) =>
                            setForm({ ...form, quantity: Number(e.target.value) })
                        }
                    />

                    <label>
                        <input type="checkbox"
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

                    <button className="btn-primary" onClick={saveToAvailableTicket}>
                        Guardar entradas
                    </button>

                    <button className="btn-secondary" onClick={downloadGeneratedTickets}>
                        Descargar entradas
                    </button>

                </div>

            )}


            {/* REGISTERED */}

            {tab === "registered" && (

                <div>

                    <input
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: "10px",
                            marginBottom: "15px",
                            width: "100%",
                            maxWidth: "300px"
                        }}
                    />

                    {groupedTickets.map(group => (

                        <div
                            key={group[0].id}
                            className="ticket-card"

                            onMouseDown={handleStart}
                            onMouseMove={handleMove}
                            onMouseUp={(e) => handleEnd(e, group)}

                            onTouchStart={handleStart}
                            onTouchMove={handleMove}
                            onTouchEnd={(e) => handleEnd(e, group)}
                        >

                            <div className="ticket-code">
                                {group.length} entradas • {new Date(group[0].created_at).toLocaleString()}
                            </div>

                            <p>{group[0].buyer_name}</p>

                            <p>${group[0].amount}</p>

                            <p>{group[0].payment_method}</p>

                            <div style={{ marginTop: "10px" }}>

                                {group.map(ticket => (
                                    <span key={ticket.id} style={{ marginRight: "8px" }}>
                                        #{ticket.ticket_number}
                                    </span>
                                ))}

                            </div>
                            {group[0].whatsapp_sent && (
                                <p style={{ color: "lime", fontWeight: "bold" }}>
                                    ✔ Enviado por WhatsApp
                                </p>
                            )}

                            {!group[0].whatsapp_sent && (
                                <button
                                    onClick={async () => {

                                        for (let ticket of group) {

                                            await supabase
                                                .from("tickets")
                                                .update({ whatsapp_sent: true })
                                                .eq("id", ticket.id)

                                        }

                                        fetchTickets()

                                    }}
                                >
                                    Marcar como enviado por WhatsApp
                                </button>
                            )}

                            <small>borrar →</small>

                        </div>

                    ))}

                </div>

            )}

            {/* AVAILABLE */}

            {tab === "available" && (

                available.map(ticket => (

                    <div key={ticket.id} className="ticket-card">

                        <div className="ticket-code">
                            #{ticket.ticket_number} • {ticket.code}
                        </div>

                        <p>Disponible</p>

                    </div>

                ))

            )}

            {/* EXPENSES */}

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