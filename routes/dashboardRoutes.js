const express = require('express');
const csv = require('csv-writer').createObjectCsvWriter;
const archiver = require('archiver');
const fs = require("fs").promises;
const { getAsync, getSelectedMessagesFromDatabase, deleteSelectedMessagesFromDatabase } = require("../utils.js")
const nodemailer = require("nodemailer");
const path = require('path');
const bcrypt = require("bcrypt");

const requireAuth = (req, res, next) => {
    if (!req.session.user?.id) {
        return res.redirect('/login');
    } else {
        next();
    }
};


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: (process.env.EMAIL_SECURE == "TRUE" ? true : false),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

module.exports = (db) => {
    const router = express.Router();
    router.use(requireAuth);
    router.get('/', (req, res) => {
        const sortColumns = {
            "firstName": "firstName",
            "lastName": "lastName",
            "phoneNumber": "phoneNumber",
            "email": "email",
            "city": "city",
            "street": "street",
            "homeNumber": "homeNumber",
            "message": "message",
        }
        const sortDirections = {
            "asc": "asc",
            "desc": "desc"
        }

        const searchQuery = (!req.query.search) ? "%%" : ("%" + req.query.search + "%");
        const sortBy = sortColumns[req.query.sortBy] || 'id';
        const sortDirection = sortDirections[req.query.sortDirection] || 'desc';// Domyślnie malejąco
        // Zapytanie SQL z uwzględnieniem warunków wyszukiwania i sortowania
        const sql = `SELECT * FROM messages
                   WHERE firstName LIKE ? OR
                         lastName LIKE ? OR
                         phoneNumber LIKE ? OR
                         email LIKE ? OR
                         city LIKE ? OR
                         street LIKE ? OR
                         homeNumber LIKE ? OR
                         message LIKE ?
                   ORDER BY ${sortBy} ${sortDirection}`;
        // Wykonaj zapytanie do bazy danych
        db.all(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery,], (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Wystąpił błąd podczas pobierania wiadomości.');
            }

            // Renderuj widok EJS, przekazując dane wiadomości
            res.render('dashboard', { messages: rows, user: req.session.user });
        });



    });

    router.delete('/delete-message/:id', (req, res) => {
        const messageId = req.params.id;


        // Zapytanie SQL do usuwania rekordu o określonym ID
        const sql = 'DELETE FROM messages WHERE id = ?';

        // Wykonaj zapytanie do bazy danych
        db.run(sql, [messageId], (err) => {
            if (err) {
                console.error(err.message);
                return res.json({ success: false, error: 'Błąd podczas usuwania rekordu.' });
            }

            // Pomyślnie usunięto rekord
            return res.json({ success: true });
        });
    });
    router.get('/send-message/:id', async (req, res) => {
        const messageId = req.params.id;


        // Zapytanie SQL do usuwania rekordu o określonym ID
        const sql = 'SELECT * FROM messages WHERE id = ?';

        const messageData = await getAsync(sql, [messageId], db);
        if (!messageData?.id) {
            return res.status(404).send('Wiadomość o podanym ID nie została znaleziona.');
        }
        let destinationEmail = null;
        if (!req.session.user.email || req.session.user.email == "") {
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
        <h2>Dane klienta:</h2> <br>
        <ul>
        <li>🗄️ Dane klienta: ${messageData.firstName} ${messageData.lastName}</li>
        <li>☎️ Nr telefonu: ${messageData.phoneNumber}</li>
        <li>🏡 Adres: ${messageData.city}, ${messageData.street} ${messageData.homeNumber}</li>
        <br>
        <h2>ℹ️ Treść wiadomości:</h2>
        <p>${messageData.message}</p>
        </ul>
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
    router.get('/message-details/:id', (req, res) => {
        const messageId = req.params.id;

        // Zapytanie SQL do pobrania szczegółów wiadomości o określonym ID
        const sql = 'SELECT * FROM messages WHERE id = ?';

        // Wykonaj zapytanie do bazy danych
        db.get(sql, [messageId], (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Wystąpił błąd podczas pobierania szczegółów wiadomości.');
            }

            if (!row) {
                return res.status(404).send('Wiadomość o podanym ID nie została znaleziona.');
            }

            // Renderuj widok EJS szczegółów wiadomości
            res.render('message-details', { message: row });
        });
    });
    router.get("/profile", (req, res) => {
        res.render("profile", { user: req.session.user });
    })
    router.post("/change-profile", async (req, res) => {
        const { newUsername, currentPassword, newPassword, newEmail } = req.body;
        const emailExpresion = new RegExp(/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/);
        if (!newEmail.match(emailExpresion) && newEmail != "") {
            return res.status(401).send("Nieprawidłowy email.");
        }
        if (currentPassword != "" && newPassword != "") {
            if (!bcrypt.compareSync(currentPassword, req.session.user.password)) {
                return res.status(401).send("Nieprawidłowe hasło.");
            }
            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            const updateQuery = 'UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?';
            db.run(updateQuery, [newUsername, hashedPassword, newEmail, req.session.user.id], (updateErr) => {
                if (updateErr) {
                    console.error(updateErr);
                    return res.status(500).send('Internal Server Error');
                }
            })
        } else {
            const updateQuery = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
            db.run(updateQuery, [newUsername, newEmail, req.session.user.id], (updateErr) => {
                if (updateErr) {
                    console.error(updateErr);
                    return res.status(500).send('Internal Server Error');
                }
            })
        }

        const user = await getAsync("SELECT * FROM users WHERE id=?", [req.session.user?.id], db);
        req.session.user = user;
        res.redirect('/dashboard');

    })
    router.post('/api/export-messages-csv', async (req, res) => {
        const selectedMessageIds = req.body.messages;
        if (!selectedMessageIds || selectedMessageIds.length === 0) {
            return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
        }
        // Pobierz wybrane wiadomości z bazy danych (przykładowa funkcja, dostosuj do swojej bazy)
        const selectedMessages = await getSelectedMessagesFromDatabase(selectedMessageIds, db).catch(err => { console.error(err); return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania wiadomości z bazy danych.' }); });

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
        const csvWriter = csv({
            path: 'exported_messages.csv',
            header: csvHeaders,
        });

        // Zapisz wiadomości do pliku CSV
        csvWriter.writeRecords(selectedMessages)
            .then(() => {
                console.log(`Plik CSV został pomyślnie wyeksportowany przez użytkownika: ${req.session.user.username}`);
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

    router.post('/api/export-messages-eml', async (req, res) => {
        const selectedMessageIds = req.body.messages;

        if (!selectedMessageIds || selectedMessageIds.length === 0) {
            return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
        }
        const tempDir = path.join(__dirname, 'temp_eml');

        try {
            // Użyj funkcji getSelectedMessagesFromDatabase z użyciem async/await
            const selectedMessages = await getSelectedMessagesFromDatabase(selectedMessageIds, db);

            if (selectedMessages.length === 0) {
                return res.status(404).json({ error: 'Brak wiadomości o podanych ID.' });
            }



            // Utwórz katalog tymczasowy do zapisywania plików .eml
            await fs.mkdir(tempDir, { recursive: true });

            // Twórz pliki .eml dla każdej wiadomości
            const emlPromises = selectedMessages.map(async (message) => {
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
    router.delete('/api/delete-messages', async (req, res) => {
        const selectedMessageIds = req.body.messages;

        if (!selectedMessageIds || selectedMessageIds.length === 0) {
            return res.status(400).json({ error: 'Brak wiadomości do usunięcia.' });
        }

        try {
            // Użyj funkcji do masowego usuwania wiadomości z bazy danych
            await deleteSelectedMessagesFromDatabase(selectedMessageIds, db);

            // Zwróć potwierdzenie sukcesu
            res.json({ success: true });
        } catch (error) {
            console.error('Błąd podczas usuwania wiadomości:', error);
            res.status(500).json({ error: 'Wystąpił błąd podczas usuwania wiadomości.' });
        }
    });



    return router
}



