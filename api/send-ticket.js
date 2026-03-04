import QRCode from "qrcode"
import { createCanvas, loadImage } from "canvas"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {

    const { email, code, name } = req.body

    try {

        const qrData = `https://essnce-qr.vercel.app/validate/${code}`

        const qrImage = await QRCode.toDataURL(qrData)

        const template = await loadImage("./public/ticket-template.jpg")

        const canvas = createCanvas(template.width, template.height)
        const ctx = canvas.getContext("2d")

        ctx.drawImage(template, 0, 0)

        const qr = await loadImage(qrImage)

        /* POSICIÓN DEL QR */
        /* AJUSTA SI ES NECESARIO */

        ctx.drawImage(qr, 340, 330, 400, 400)

        /* Nombre opcional */

        ctx.fillStyle = "white"
        ctx.font = "bold 50px Montserrat"
        ctx.textAlign = "center"

        ctx.fillText(name || "", template.width / 2, 850)

        const buffer = canvas.toBuffer()

        await resend.emails.send({

            from: "Essnce <onboarding@resend.dev>",

            to: email,

            subject: "Tu entrada para Essnce",

            html: `
<h2>Tu entrada para Essnce</h2>
<p>Presenta esta entrada en la puerta.</p>
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
        res.status(500).json({ error: "error enviando email" })

    }

}