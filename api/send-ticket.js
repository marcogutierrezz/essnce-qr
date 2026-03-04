import { createCanvas, loadImage } from "@napi-rs/canvas"
import QRCode from "qrcode"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {

    try {

        const { email, code } = req.body

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

        /* POSICIÓN DEL QR */
        ctx.drawImage(qr, 330, 230, 200, 200)

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