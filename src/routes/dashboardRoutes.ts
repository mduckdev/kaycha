import express, { Request, Response, Router } from 'express';
import { createObjectCsvWriter } from 'csv-writer';
import archiver from 'archiver';
import { promises as fs } from 'fs';
import { getSelectedMessagesFromDatabase, deleteSelectedMessagesFromDatabase } from '../utils';
import nodemailer from 'nodemailer';
import path from 'path';
import bcrypt from 'bcrypt';
import { MessageI, UserI } from '../interfaces/models';
import { Session, SessionData } from 'express-session';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AppDataSource } from '../data-source';
import { Message } from '../entity/Message';
import "reflect-metadata"
import { User } from '../entity/User';
import dotenv from 'dotenv';

dotenv.config()
declare module "express-session" {
    interface SessionData {
        user: User;
    }
}


const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.user?.id) {
        return res.redirect('/login');
    } else {
        next();
    }
};

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



export function dashboardRoutes(): Router {
    const router = express.Router();
    router.use(requireAuth);
    router.get('/', async (req: Request, res: Response) => {
        const sortColumns: { [key: string]: string } = {
            "firstName": "firstName",
            "lastName": "lastName",
            "phoneNumber": "phoneNumber",
            "email": "email",
            "city": "city",
            "street": "street",
            "homeNumber": "homeNumber",
            "message": "message",
        }


        const searchQuery = (!req.query.search) ? "%%" : ("%" + req.query.search + "%");
        const sortBy = sortColumns[String(req.query.sortBy)] || 'id';
        const sortDirection = String(req.query.sortDirection) || 'desc';// Domyślnie malejąco
        try {

            // Get repository for Message entity
            const messageRepository = AppDataSource.getRepository(Message);

            // Perform the database query
            const messages = await messageRepository.createQueryBuilder('message')
                .where('message.firstName LIKE :searchQuery OR message.lastName LIKE :searchQuery OR message.phoneNumber LIKE :searchQuery OR message.email LIKE :searchQuery OR message.city LIKE :searchQuery OR message.street LIKE :searchQuery OR message.homeNumber LIKE :searchQuery OR message.message LIKE :searchQuery', { searchQuery })
                .orderBy(`message.${sortBy}`, sortDirection == "asc" ? "ASC" : "DESC")
                .getMany();


            res.render('dashboard', { messages, user: req.session.user });
        } catch (error) {
            console.error('Error occurred while fetching messages from the database:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    router.delete('/delete-message/:id', async (req: Request, res: Response) => {
        const messageId = req.params.id;

        const messageRepository = AppDataSource.getRepository(Message);

        const messageToRemove = await messageRepository.findOneByOrFail({ id: Number(messageId) }).catch(error => {
            console.error(error);
            res.status(401).send("No such message").end();
            return;
        });
        if (messageToRemove) {
            await messageRepository.remove(messageToRemove);
            return res.json({ success: true });
        }


    });

    router.get('/send-message/:id', async (req: Request, res: Response) => {
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

        const firstName = messageData.firstName;

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

    });

    router.get('/message-details/:id', async (req: Request, res: Response) => {
        const messageId = req.params.id;
        const messageRepository = AppDataSource.getRepository(Message);
        try {
            const messageDetails = await messageRepository.findOneByOrFail({ id: Number(messageId) });
            res.render('message-details', { message: messageDetails });
        } catch (err: any) {
            console.error('Błąd podczas pobierania szczegółów wiadomości:', err.message);
            if (err.name === 'EntityNotFound') {
                return res.status(404).send('Wiadomość o podanym ID nie została znaleziona.');
            } else {
                return res.status(500).send('Wystąpił błąd podczas pobierania szczegółów wiadomości.');
            }
        }
    });

    router.get("/profile", (req: Request, res: Response) => {
        res.render("profile", { user: req.session.user });
    });

    router.post("/change-profile", async (req: Request, res: Response) => {
        const { newUsername, currentPassword, newPassword, newEmail } = req.body;
        const emailExpresion = new RegExp(/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/);
        if (!newEmail.match(emailExpresion) && newEmail != "") {
            return res.status(401).send("Nieprawidłowy email.");
        }

        const userRepository = AppDataSource.getRepository(User);
        const currentUser = await userRepository.findOneBy({ id: req.session.user?.id });

        if (!currentUser) {
            return res.status(500).send('Nie można znaleźć użytkownika.');
        }

        if (currentPassword !== "" && newPassword !== "") {
            if (!bcrypt.compareSync(currentPassword, currentUser.password)) {
                return res.status(401).send("Nieprawidłowe hasło.");
            }

            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            currentUser.username = newUsername;
            currentUser.password = hashedPassword;
            currentUser.email = newEmail;

        } else {
            currentUser.username = newUsername;
            currentUser.email = newEmail;
        }

        try {
            await userRepository.save(currentUser);
        } catch (updateErr) {
            console.error(updateErr);
            return res.status(500).send('Internal Server Error');
        }

        const updatedUser = await userRepository.findOneBy({ id: req.session.user?.id });

        if (!updatedUser) {
            return res.status(500).send('Nie można znaleźć zaktualizowanego użytkownika.');
        }

        req.session.user = updatedUser;
        res.redirect('/dashboard');
    });

    router.post('/api/export-messages-csv', async (req: Request, res: Response) => {
        const selectedMessageIds = req.body.messages;
        if (!selectedMessageIds || selectedMessageIds.length === 0) {
            return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
        }
        // Pobierz wybrane wiadomości z bazy danych (przykładowa funkcja, dostosuj do swojej bazy)
        const selectedMessages = await getSelectedMessagesFromDatabase(selectedMessageIds).catch(err => { console.error(err); return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania wiadomości z bazy danych.' }); });

        if (!selectedMessages || selectedMessages.length === 0) {
            return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
        }

        // Definiuj nagłówki pliku CSV
        const csvHeaders = [
            { id: 'timestamp', title: 'Data' },
            { id: 'firstName', title: 'Imię' },
            { id: 'lastName', title: 'Nazwisko' },
            { id: 'phoneNumber', title: 'Numer telefonu' },
            { id: 'email', title: 'Email' },
            { id: 'city', title: 'Miejscowość' },
            { id: 'street', title: 'Ulica' },
            { id: 'homeNumber', title: 'Numer domu/mieszkania' },
            { id: 'message', title: 'Treść wiadomości' },
        ];

        // Utwórz obiekt csvWriter z nagłówkami
        const csvWriter = createObjectCsvWriter({
            path: 'exported_messages.csv',
            header: csvHeaders,
        });

        // Zapisz wiadomości do pliku CSV
        csvWriter.writeRecords(selectedMessages)
            .then(() => {
                console.log(`Plik CSV został pomyślnie wyeksportowany przez użytkownika: ${req.session.user?.username}`);
                // Odpowiedź klientowi z linkiem do pobrania pliku
                res.download('exported_messages.csv', 'exported_messages.csv', (err) => {
                    if (err) {
                        console.error('Błąd podczas wysyłania pliku:', err);
                        res.status(500).json({ error: 'Wystąpił błąd podczas wysyłania pliku.' });
                    }
                });
            })
            .catch(error => {
                console.error('Błąd podczas zapisywania do pliku CSV:', error);
                res.status(500).json({ error: 'Wystąpił błąd podczas eksportowania.' });
            });
    });

    router.post('/api/export-messages-eml', async (req: Request, res: Response) => {
        const selectedMessageIds = req.body.messages;

        if (!selectedMessageIds || selectedMessageIds.length === 0) {
            return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
        }
        const tempDir = path.join(__dirname, 'temp_eml');

        try {
            // Użyj funkcji getSelectedMessagesFromDatabase z użyciem async/await
            const selectedMessages = await getSelectedMessagesFromDatabase(selectedMessageIds);

            if (selectedMessages.length === 0) {
                return res.status(404).json({ error: 'Brak wiadomości o podanych ID.' });
            }



            // Utwórz katalog tymczasowy do zapisywania plików .eml
            await fs.mkdir(tempDir, { recursive: true });

            // Twórz pliki .eml dla każdej wiadomości
            const emlPromises = selectedMessages.map(async (message: MessageI) => {
                const emlContent = `Delivered-To: ${message.email}
    Return-Path: <${message.email}>
    From: =?UTF-8?Q?${message.firstName} ${message.lastName}?= <${message.email}>
    To: <test@test.com>
    Subject: Wiadomość od ${message.firstName} ${message.lastName} 
    Date: ${new Date(message.timestamp).toUTCString()}
    Content-Type: text/plain; charset=utf-8; format=flowed
    Content-Transfer-Encoding: 7bit
    Content-Language: pl-PL
    Reply-To: ${message.firstName} ${message.lastName} <${message.email}>
    
    Dane klienta: 
    Imię: ${message.firstName} Nazwisko: ${message.lastName}
    Nr telefonu: ${message.phoneNumber}
    Adres: ${message.city}, ${message.street} ${message.homeNumber}
    Treść wiadomości:
    ${message.message}`;

                const fileName = `${tempDir}/message_${message.id}.eml`;
                await fs.writeFile(fileName, emlContent);
                return fileName;
            });

            // Czekaj na zakończenie wszystkich obietnic .eml
            const emlFiles = await Promise.all(emlPromises);

            // Twórz plik ZIP i dodaj pliki .eml
            const archive = archiver('zip');
            emlFiles.forEach((emlFile) => {
                const fileName = emlFile.split('/').pop();
                archive.file(emlFile, { name: fileName });
            });

            // Zakończ i utwórz plik ZIP
            archive.finalize();

            // Wysyłaj plik ZIP do przeglądarki
            res.attachment('exported_messages.zip');

            archive.pipe(res)

            archive.on("finish", () => {
                fs.rm(tempDir, { recursive: true, force: true });
            })

        } catch (error) {
            console.error('Błąd podczas eksportowania plików .eml:', error);
            res.status(500).json({ error: 'Wystąpił błąd podczas eksportowania plików .eml.' });
        }
    });

    router.delete('/api/delete-messages', async (req: Request, res: Response) => {
        const selectedMessageIds = req.body.messages;

        if (!selectedMessageIds || selectedMessageIds.length === 0) {
            return res.status(400).json({ error: 'Brak wiadomości do usunięcia.' });
        }

        try {
            // Użyj funkcji do masowego usuwania wiadomości z bazy danych
            await deleteSelectedMessagesFromDatabase(selectedMessageIds);
            // Zwróć potwierdzenie sukcesu
            res.json({ success: true });
        } catch (error) {
            console.error('Błąd podczas usuwania wiadomości:', error);
            res.status(500).json({ error: 'Wystąpił błąd podczas usuwania wiadomości.' });
        }
    });

    return router;
}