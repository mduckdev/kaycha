"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageController = void 0;
const data_source_1 = require("../../data-source");
const Message_1 = require("../../entity/Message");
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporterOptions = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: (process.env.EMAIL_SECURE == "TRUE" ? true : false),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
};
const transporter = nodemailer_1.default.createTransport(transporterOptions);
const sendMessageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const messageId = req.params.id;
    const messageRepository = (yield data_source_1.AppDataSource).getRepository(Message_1.Message);
    const messageData = yield messageRepository.findOneByOrFail({ id: Number(messageId) }).catch(err => {
        console.error('Error occurred while fetching message from the database:', err);
        return res.status(500).send('Internal Server Error');
    });
    if (!messageData) {
        return res.status(404).send('Wiadomość o podanym ID nie została znaleziona.');
    }
    let destinationEmail = null;
    if (!((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.email) || req.session.user.email == "") {
        destinationEmail = process.env.EMAIL_DESTINATION;
    }
    else {
        destinationEmail = req.session.user.email;
    }
    if (!destinationEmail || destinationEmail == "") {
        return res.status(404).send('Nie można wysłać wiadomości email, brak adresata.');
    }
    const plainTextMessage = `Dane klienta: ${messageData.firstName} ${messageData.lastName}
        Nr telefonu: ${messageData.phoneNumber}
        Adres: ${messageData.city}, ${messageData.street} ${messageData.homeNumber}
        Treść wiadomości:
        ${messageData.message}`;
    const htmlMessage = `
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
    `;
    const emailObject = {
        from: `"System powiadomień" <${process.env.EMAIL_USER_ADDRESS}>`, // sender address
        replyTo: `${messageData.firstName} ${messageData.lastName} <${messageData.email}>`,
        to: destinationEmail, // list of receivers
        subject: `Wiadomość od ${messageData.firstName}`, // Subject line
        text: plainTextMessage, // plain text body
        html: htmlMessage, // html body
    };
    transporter.sendMail(emailObject).then(x => {
        return res.json({ success: true });
    }).catch(err => { console.error(err); return res.status(500).send('Wystąpił błąd podczas wysyłania wiadomości na maila.'); });
});
exports.sendMessageController = sendMessageController;
