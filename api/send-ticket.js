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
<div style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f4; padding:40px">

    <div style="max-width:520px; margin:auto; background:white; border-radius:12px; padding:35px; text-align:center">

        <h1 style="margin:0; color:#111; font-size:28px;">
            🎟️ Entrada Confirmada
        </h1>

        <p style="margin-top:20px; font-size:16px; color:#444;">
            Tu entrada para <strong>Essnce</strong> ha sido registrada correctamente.
        </p>

        <p style="color:#666; margin-top:10px;">
            Presenta el código QR adjunto en puerta para ingresar.
        </p>

        <div style="
            margin-top:25px;
            background:#111;
            color:white;
            padding:14px 18px;
            border-radius:8px;
            font-size:18px;
            letter-spacing:2px;
            display:inline-block;
        ">
            Código: ${code}
        </div>

        <p style="margin-top:25px; color:#777; font-size:14px;">
            Tu ticket está adjunto en este correo.  
            Puedes guardarlo o mostrarlo directamente desde tu teléfono.
        </p>

        <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">


    </div>

</div>
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