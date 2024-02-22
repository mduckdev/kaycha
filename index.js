const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const { validateContactForm, setupDB, getAsync, getSelectedMessagesFromDatabase, deleteSelectedMessagesFromDatabase } = require("./utils.js")
require('dotenv').config()
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require("fs").promises;
const { rateLimit } = require('express-rate-limit')
const nodemailer = require("nodemailer");
const csv = require('csv-writer').createObjectCsvWriter;
const archiver = require('archiver');

const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database(process.env.DB_FILE || "database.db");
setupDB(db, process.env.DEFAULT_USER, process.env.DEFAULT_PASSWORD);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: { maxAge: 24 * 60 * 60 * 1000 } }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('trust proxy', 1)


const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 2, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
});
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: (process.env.EMAIL_SECURE == "TRUE" ? true : false),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const requireAuth = (req, res, next) => {
    if (!req.session.user?.id) {
        return res.redirect('/login');
    } else {
        next();
    }
};




app.use("/", express.static("static"));
app.get('/login', (req, res) => {
    res.render("login");
});
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await getAsync("SELECT * FROM users WHERE username=?", [username], db);
    const hashedPassword = user?.password || "";
    if (user && bcrypt.compareSync(password, hashedPassword)) {
        req.session.user = user;
        return res.redirect("/dashboard")
    } else {
        return res.redirect("/login");
    }
});


app.get('/logout', (req, res) => {
    req.session.user = null;
    req.session.destroy((err) => {
        if (err) console.error(err)
        res.redirect("/");

    })
});
app.post("/api/contact", limiter, async (req, res) => {
    const { firstName, lastName, phoneNumber, email, city, street, homeNumber, message } = req.body;
    const response = await validateContactForm(req.body, "PL", process.env.HCAPTCHA_PRIVATE_KEY);
    const { isValid } = response;
    const clientIP = req?.header('x-forwarded-for')?.split(",")[0] ||
        req.socket.remoteAddress;
    const clientPort = req.socket.remotePort;
    if (!isValid) {
        return res.send(JSON.stringify(response));
    }
    const timestamp = Date.now();

    db.run("INSERT INTO messages(firstName,lastName,phoneNumber,email,city,street,homeNumber,message,timestamp,ip_address,port_number) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [firstName, lastName, phoneNumber, email, city, street, homeNumber, message, timestamp, clientIP, clientPort], function (err) {
        if (err) {
            console.log("Error occured while adding message to database: " + err);
        } {
            console.log("Successfuly added new message to database from: " + firstName);
        }
    })
    res.send(response);
    res.end();
});

app.get("/get-listings", (req, res) => {
    res.send(JSON.stringify([
        {
            title: "Koparka kramer",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6IjE4MmN5eDFhczlmbS1PVE9NT1RPUEwiLCJ3IjpbeyJmbiI6IndnNGducXA2eTFmLU9UT01PVE9QTCIsInMiOiIxNiIsInAiOiIxMCwtMTAiLCJhIjoiMCJ9XX0.19droFAdqgM2_n3zCCBPAHiRE3lJojTYTTVxlykXVxw/image;s=0x450;q=70",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1990,
            price: 42900,

        },
        {
            title: "Koparka kramer 2",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6Inl6ZGw3NmdoNXMzNDMtT1RPTU9UT1BMIiwidyI6W3siZm4iOiJ3ZzRnbnFwNnkxZi1PVE9NT1RPUEwiLCJzIjoiMTYiLCJwIjoiMTAsLTEwIiwiYSI6IjAifV19.DsHTE5tqA9QjSP5AoNIZNu9Jx56dKOTY4XBgJbCtr2A/image;s=1920x0",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1990,
            price: 42900,

        },
        {
            title: "Koparka kramer 3",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6ImptNDVxeWxmeTl1cDItT1RPTU9UT1BMIiwidyI6W3siZm4iOiJ3ZzRnbnFwNnkxZi1PVE9NT1RPUEwiLCJzIjoiMTYiLCJwIjoiMTAsLTEwIiwiYSI6IjAifV19._vkCo0kIxGV74s5krqV-PiTzw-fZ40nWuifg15Zv7BA/image;s=1920x0",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1989,
            price: 42900,

        },
        {
            title: "Koparka kramer 4",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6ImptNDVxeWxmeTl1cDItT1RPTU9UT1BMIiwidyI6W3siZm4iOiJ3ZzRnbnFwNnkxZi1PVE9NT1RPUEwiLCJzIjoiMTYiLCJwIjoiMTAsLTEwIiwiYSI6IjAifV19._vkCo0kIxGV74s5krqV-PiTzw-fZ40nWuifg15Zv7BA/image;s=1920x0",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1989,
            price: 42900,

        },
        {
            title: "Koparka kramer 5",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6ImptNDVxeWxmeTl1cDItT1RPTU9UT1BMIiwidyI6W3siZm4iOiJ3ZzRnbnFwNnkxZi1PVE9NT1RPUEwiLCJzIjoiMTYiLCJwIjoiMTAsLTEwIiwiYSI6IjAifV19._vkCo0kIxGV74s5krqV-PiTzw-fZ40nWuifg15Zv7BA/image;s=1920x0",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1989,
            price: 42900,

        },
        {
            title: "Koparka kramer 6",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6ImptNDVxeWxmeTl1cDItT1RPTU9UT1BMIiwidyI6W3siZm4iOiJ3ZzRnbnFwNnkxZi1PVE9NT1RPUEwiLCJzIjoiMTYiLCJwIjoiMTAsLTEwIiwiYSI6IjAifV19._vkCo0kIxGV74s5krqV-PiTzw-fZ40nWuifg15Zv7BA/image;s=1920x0",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1989,
            price: 42900,

        },
    ]))
})



app.get('/dashboard', requireAuth, (req, res) => {
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

app.delete('/delete-message/:id', requireAuth, (req, res) => {
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
app.get('/send-message/:id', requireAuth, async (req, res) => {
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
    //     `Delivered-To: ${message.email}
    // Return-Path: <${message.email}>
    // From: =?UTF-8?Q?${message.firstName} ${message.lastName}?= <${message.email}>
    // To: <test@test.com>
    // Subject: Wiadomość od ${message.firstName} ${message.lastName} 
    // Date: ${new Date(message.timestamp).toUTCString()}
    // Content-Type: text/plain; charset=utf-8; format=flowed
    // Content-Transfer-Encoding: 7bit
    // Content-Language: pl-PL
    // Reply-To: ${message.firstName} ${message.lastName} <${message.email}>

    // Dane klienta: 
    // Imię: ${message.firstName} Nazwisko: ${message.lastName}
    // Nr telefonu: ${message.phoneNumber}
    // Adres: ${message.city}, ${message.street} ${message.homeNumber}
    // Treść wiadomości:
    // ${message.message}`

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
app.get('/message-details/:id', requireAuth, (req, res) => {
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
app.get("/profile", requireAuth, (req, res) => {
    res.render("profile", { user: req.session.user });
})
app.post("/change-profile", requireAuth, async (req, res) => {
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
app.post('/api/export-messages-csv', requireAuth, async (req, res) => {
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

app.post('/api/export-messages-eml', requireAuth, async (req, res) => {
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
app.delete('/api/delete-messages', requireAuth, async (req, res) => {
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

app.listen(port, () => {
    console.log(`Server is listening at port: http://localhost:${port}`);
});

