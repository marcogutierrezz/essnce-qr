import { createCanvas, loadImage } from "@napi-rs/canvas"
import QRCode from "qrcode"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

    try {

        const { email, code } = req.body

        console.log("EMAIL RECIBIDO:", email)
        console.log("CODE RECIBIDO:", code)

        if (!email || !code) {
            return res.status(400).json({ error: "Missing email or code" })
        }

        const template = await loadImage(
            "https://essnce-qr.vercel.app/ticket-template.jpg"
        )

        const canvas = createCanvas(template.width, template.height)
        const ctx = canvas.getContext("2d")

        ctx.drawImage(template, 0, 0)

        const qrData = await QRCode.toDataURL(
            `https://essnce-qr.vercel.app/validate/${code}`
        )

        const qr = await loadImage(qrData)

        const qrSize = 440
        const x = (template.width / 2) - (qrSize / 2)
        const y = 309

        ctx.drawImage(qr, x, y, qrSize, qrSize)

        const buffer = canvas.toBuffer("image/png")

        await resend.emails.send({
            from: "Essnce <onboarding@resend.dev>",
            to: email,
            subject: "Tu entrada para Essnce",
            html: `
<h2>Tu entrada para Essnce</h2>
<p>Presenta esta entrada en la puerta</p>
`,
            attachments: [
                {
                    filename: "entrada-essnce.png",
                    content: buffer
                }
            ]
        })

        res.status(200).json({ success: true })

    } catch (err) {

        console.log(err)
        res.status(500).json({ error: "email failed" })

    }

}