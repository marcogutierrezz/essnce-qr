import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {

    try {

        const { email, code } = req.body

        const qr = encodeURIComponent(
            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://essnce-qr.vercel.app/validate/${code}`
        )

        const ticketImage = `https://images.weserv.nl/?url=essnce-qr.vercel.app/ticket-template.jpg&overlay=${qr}&overlay_x=330&overlay_y=230&overlay_w=200&overlay_h=200`

        await resend.emails.send({
            from: "Essnce <onboarding@resend.dev>",
            to: email,
            subject: "Tu entrada para Essnce",
            html: `
      <div style="background:black;padding:40px;text-align:center">
        <img src="${ticketImage}" width="420" style="border-radius:10px"/>
        <p style="color:white;margin-top:20px">
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