import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import "./App.css"

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
        return (
            <div className="container">
                <h1>Verificando entrada...</h1>
            </div>
        )
    }

    if (status === "valid") {
        return (
            <div className="valid-screen">
                ENTRADA VÁLIDA
                <h2>Bienvenido a Essnce</h2>
            </div>
        )
    }

    if (status === "invalid_or_used") {
        return (
            <div className="invalid-screen">
                ENTRADA INVÁLIDA O YA USADA
            </div>
        )
    }

    return null
}

export default Validate