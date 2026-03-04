import nodemailer from "nodemailer"
import QRCode from "qrcode"
import fs from "fs"
import path from "path"
import sharp from "sharp"

export default async function handler(req, res) {

    try {

        const { email, code, name } = req.body

        if (!email || !code) {
            return res.status(400).json({ success: false })
        }

        /* GENERAR QR */

        const qrBuffer = await QRCode.toBuffer(code)

        /* CARGAR TEMPLATE */

        const templatePath = path.join(process.cwd(), "public", "entrada-essnce.png")

        const template = fs.readFileSync(templatePath)

        /* CREAR IMAGEN FINAL */

        const finalImage = await sharp(template)
            .composite([
                {
                    input: qrBuffer,
                    top: 980,
                    left: 440,
                    width: 420,
                    height: 420
                }
            ])
            .png()
            .toBuffer()

        /* CONFIGURAR EMAIL */

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        /* ENVIAR EMAIL */

        await transporter.sendMail({
            from: `"ESSNCE" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Tu entrada ESSNCE",
            html: `<p>Hola ${name || ""}, aquí está tu entrada.</p>`,
            attachments: [
                {
                    filename: "entrada.png",
                    content: finalImage
                }
            ]
        })

        return res.status(200).json({ success: true })

    } catch (error) {

        console.error(error)

        return res.status(500).json({ success: false })

    }

}