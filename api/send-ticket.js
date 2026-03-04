import { Resend } from 'resend'
import QRCode from 'qrcode'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" })
    }

    const { email, code, name } = req.body

    try {

        const url = `https://essnce-qr.vercel.app/validate/${code}`

        // Generar QR en base64
        const qrImage = await QRCode.toDataURL(url)

        // Quitar el prefijo "data:image/png;base64,"
        const base64Data = qrImage.split(",")[1]

        await resend.emails.send({
            from: 'Essnce <onboarding@resend.dev>',
            to: email,
            subject: 'Tu entrada para Essnce',
            html: `
        <h1>Hola ${name}</h1>
        <p>Aquí está tu entrada oficial para Essnce.</p>
        <p>No compartas este código.</p>
      `,
            attachments: [
                {
                    filename: `entrada-${code}.png`,
                    content: base64Data,
                    encoding: "base64"
                }
            ]
        })

        return res.status(200).json({ success: true })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: error.message })
    }
}