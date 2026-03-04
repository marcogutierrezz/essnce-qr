import { Routes, Route } from "react-router-dom"
import Navbar from "./Navbar"
import Home from "./Home"
import Admin from "./Admin"
import Scan from "./Scan"

function App() {
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

            <label>
              <input
                type="checkbox"
                checked={ticket.paid || false}
                onChange={(e) =>
                  handleLocalChange(ticket.id, "paid", e.target.checked)
                }
              />
              Pagado
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

export default App