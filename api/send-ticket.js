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
<div style="background:#0b0b0b; padding:50px 20px; font-family:Arial, Helvetica, sans-serif;">

    <div style="max-width:520px; margin:auto; background:#111; border-radius:16px; padding:40px; text-align:center; color:white;">

        <h1 style="
            font-size:42px;
            letter-spacing:4px;
            margin:0;
            font-weight:900;
        ">
            ESSNCE
        </h1>

        <p style="
            color:#ff2f92;
            font-size:18px;
            margin-top:10px;
            letter-spacing:2px;
        ">
            ENTRADA CONFIRMADA
        </p>

        <div style="
            width:60px;
            height:4px;
            background:#ff2f92;
            margin:25px auto;
            border-radius:10px;
        "></div>

        <p style="
            font-size:16px;
            color:#ccc;
            line-height:1.6;
        ">
            Tu entrada para <strong>Essnce 3.1</strong> ha sido registrada correctamente.
        </p>

        <p style="
            font-size:15px;
            color:#aaa;
            margin-top:10px;
        ">
            Presenta el QR de tu ticket adjunto al llegar al evento.
        </p>

        <div style="
            margin-top:35px;
            padding:18px;
            border-radius:10px;
            background:linear-gradient(90deg,#ff2f92,#6c5cff);
            font-weight:600;
            letter-spacing:1px;
        ">
            ESCANEA TU QR AL ENTRAR
        </div>

        <div style="
            margin-top:35px;
            color:#999;
            font-size:14px;
        ">
            11 de abril | 21:00 - 2:00<br>
            #12, Calle Los Abetos, San Salvador
        </div>

        <div style="
            margin-top:25px;
            font-size:13px;
            color:#666;
        ">
            Evento exclusivo +18
        </div>

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