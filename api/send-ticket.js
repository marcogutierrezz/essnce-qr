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
        const qrImage = await QRCode.toDataURL(url)

        await resend.emails.send({
            from: 'Essnce <tickets@essnce.com>',
            to: email,
            subject: 'Tu entrada para Essnce',
            html: `
        <h1>Hola ${name}</h1>
        <p>Aquí está tu entrada oficial para Essnce.</p>
        <img src="${qrImage}" />
        <p>No compartas este código.</p>
      `
        })

        return res.status(200).json({ success: true })

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}