import { useState } from "react"

export default function PinGate({ children }) {

    const [pin, setPin] = useState("")
    const [authorized, setAuthorized] = useState(
        localStorage.getItem("event_auth") === "true"
    )

    async function checkPin() {

        const res = await fetch(
            "https://TU_PROJECT_ID.supabase.co/functions/v1/check-pin",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ pin })
            }
        )

        if (res.ok) {

            localStorage.setItem("event_auth", "true")
            setAuthorized(true)

        } else {

            alert("PIN incorrecto")

        }

    }

    if (!authorized) {

        return (
            <div className="pin-screen">

                <h2>Acceso Staff</h2>

                <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN"
                />

                <button onClick={checkPin}>
                    Entrar
                </button>

            </div>
        )
    }

    return children
}