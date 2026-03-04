import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function Validate() {

    const { code } = useParams()
    const [status, setStatus] = useState("checking")

    useEffect(() => {

        async function validateTicket() {

            setStatus("checking")

            const { data } = await supabase
                .from('tickets')
                .update({ used: true, used_at: new Date() })
                .eq('code', code)
                .eq('used', false)
                .select()

            if (!data || data.length === 0) {
                setStatus("invalid")
            } else {
                setStatus("valid")
            }
        }

        validateTicket()

    }, [code])

    if (status === "checking") {
        return (
            <div className="container">
                <h1>Verificando...</h1>
            </div>
        )
    }

    if (status === "valid") {
        return (
            <div className="valid-screen">
                ENTRADA VÁLIDA
                <h2>Bienvenido a Essnce</h2>

                <button
                    style={{ marginTop: "30px" }}
                    onClick={() => window.location.href = "/scan"}
                >
                    Escanear Otro
                </button>
            </div>
        )
    }

    if (status === "invalid") {
        return (
            <div className="invalid-screen">
                ENTRADA INVÁLIDA O YA USADA

                <button
                    style={{ marginTop: "30px" }}
                    onClick={() => window.location.href = "/scan"}
                >
                    Escanear Otro
                </button>
            </div>
        )
    }

    return null
}

export default Validate