import { useState, useEffect } from "react"

const PIN = "022724"

export default function PinGate({ children }) {

    const [enteredPin, setEnteredPin] = useState("")
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {

        const saved = sessionStorage.getItem("event_pin")

        if (saved === PIN) {
            setAuthorized(true)
        }

    }, [])

    function handleSubmit() {

        if (enteredPin === PIN) {

            sessionStorage.setItem("event_pin", PIN)
            setAuthorized(true)

        } else {

            alert("PIN incorrecto")

        }

    }

    if (!authorized) {

        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                gap: "10px"
            }}>

                <h2>Ingresar PIN</h2>

                <input
                    type="password"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    placeholder="PIN"
                />

                <button onClick={handleSubmit}>
                    Entrar
                </button>

            </div>
        )
    }

    return children
}