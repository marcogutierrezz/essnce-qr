import QRCode from "qrcode"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {

    try {

        const { email, code, name } = req.body

        const qrUrl = await QRCode.toDataURL(
            `https://essnce-qr.vercel.app/validate/${code}`
        )

        await resend.emails.send({

            from: "Essnce <onboarding@resend.dev>",

            to: email,

            subject: "Tu entrada para Essnce",

            html: `

<div style="
font-family:Montserrat, sans-serif;
background:black;
padding:20px;
text-align:center;
">

<div style="
position:relative;
display:inline-block;
max-width:400px;
">

<img
src="https://essnce-qr.vercel.app/ticket-template.jpg"
style="width:100%;border-radius:10px"
/>

<img
src="${qrUrl}"
style="
position:absolute;
top:220px;
left:50%;
transform:translateX(-50%);
width:180px;
height:180px;
background:white;
padding:10px;
border-radius:12px;
"
/>

</div>

<p style="margin-top:20px;color:white">
Presenta este QR en la entrada
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