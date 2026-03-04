import QRCode from "qrcode"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {

    try {

        const { email, code } = req.body

        const qrUrl = await QRCode.toDataURL(
            `https://essnce-qr.vercel.app/validate/${code}`
        )

        await resend.emails.send({

            from: "Essnce <onboarding@resend.dev>",

            to: email,

            subject: "Tu entrada para Essnce",

            html: `

<div style="background:#000;padding:40px;text-align:center">

<img 
src="https://essnce-qr.vercel.app/ticket-template.jpg"
width="420"
style="display:block;margin:auto;border-radius:10px"
/>

<div style="margin-top:-420px">

<img
src="${qrUrl}"
width="180"
style="
background:white;
padding:10px;
border-radius:12px;
"
/>

</div>

<p style="margin-top:40px;color:white">
Presenta este código al ingresar
</p>

</div>

`

        })

        res.status(200).json({ success: true })

    } catch (err) {

        console.log(err)
        res.status(500).json({ error: "email failed" })

    }

}