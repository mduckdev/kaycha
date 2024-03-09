
import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Message } from '../../entity/Message';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const transporterOptions: SMTPTransport.Options = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: (process.env.EMAIL_SECURE == "TRUE" ? true : false),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
}
const transporter = nodemailer.createTransport(transporterOptions);

export const sendMessageController = async (req: Request, res: Response) => {
    const messageId = req.params.id;

    const messageRepository = AppDataSource.getRepository(Message);

    const messageData: any = await messageRepository.findOneOrFail({ where: { id: Number(messageId) } }).catch(err => {
        console.error('Error occurred while fetching message from the database:', err);
        return res.status(500).send('Internal Server Error');
    });
    if (!messageData) {
        return res.status(404).send('Wiadomość o podanym ID nie została znaleziona.');
    }

    let destinationEmail = null;
    if (!req.session.user?.email || req.session.user.email == "") {
        destinationEmail = process.env.EMAIL_DESTINATION;
    } else {
        destinationEmail = req.session.user.email;
    }
    if (!destinationEmail || destinationEmail == "") {
        return res.status(404).send('Nie można wysłać wiadomości email, brak adresata.');
    }

    const plainTextMessage =
        `Dane klienta: ${messageData.firstName} ${messageData.lastName}
        Nr telefonu: ${messageData.phoneNumber}
        Adres: ${messageData.city}, ${messageData.street} ${messageData.homeNumber}
        Treść wiadomości:
        ${messageData.message}`;
    const htmlMessage =
        `
        <!DOCTYPE html>
        <html lang="pl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                }
        
                h2 {
                    color: #007bff;
                }
        
                ul {
                    list-style-type: none;
                    padding: 0;
                }
        
                li {
                    margin-bottom: 10px;
                }
        
                p {
                    margin-top: 0;
                }
            </style>
        </head>
        <body>
            <h2>Dane klienta:</h2>
            <ul>
                <li>🗄️ Dane klienta: ${messageData.firstName} ${messageData.lastName}</li>
                <li>☎️ Nr telefonu: ${messageData.phoneNumber}</li>
                <li>🏡 Adres: ${messageData.city}, ${messageData.street} ${messageData.homeNumber}</li>
            </ul>
            <h2>ℹ️ Treść wiadomości:</h2>
            <p>${messageData.message}</p>
        </body>
        </html>
    `
    const emailObject = {
        from: `"System powiadomień" <${process.env.EMAIL_USER_ADDRESS}>`, // sender address
        replyTo: `${messageData.firstName} ${messageData.lastName} <${messageData.email}>`,
        to: destinationEmail, // list of receivers
        subject: `Wiadomość od ${messageData.firstName}`, // Subject line
        text: plainTextMessage, // plain text body
        html: htmlMessage, // html body
    }

    transporter.sendMail(emailObject).then(x => {
        return res.json({ success: true })
    }).catch(err => { console.error(err); return res.status(500).send('Wystąpił błąd podczas wysyłania wiadomości na maila.'); })

}