import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function Validate() {

    const { code } = useParams()
    const [status, setStatus] = useState("checking")

    useEffect(() => {

        async function validateTicket() {

            const { data, error } = await supabase
                .from('tickets')
                .update({ used: true, used_at: new Date() })
                .eq('code', code)
                .eq('used', false)
                .select()

            if (error) {
                setStatus("error")
                return
            }

            if (data.length === 0) {
                setStatus("invalid_or_used")
            } else {
                setStatus("valid")
            }
        }

        validateTicket()

    }, [code])

    if (status === "checking") {
        return <h1 style={{ padding: "40px" }}>Verificando...</h1>
    }

    if (status === "valid") {
        return (
            <div style={{ background: "#00ff88", color: "white", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <h1>ENTRADA VÁLIDA</h1>
                <h2 style={{ fontSize: "30px" }}>BIENVENIDO A ESSNCE</h2>
            </div>
        )
    }

    if (status === "invalid_or_used") {
        return (
            <div style={{ background: "#ff0033", color: "white", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <h1>ENTRADA INVÁLIDA O YA USADA</h1>
            </div>
        )
    }

    return null
}

export default Validate