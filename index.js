const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const { validateContactForm, setupDB, getAsync } = require("./utils.js")
require('dotenv').config()
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { rateLimit } = require('express-rate-limit')
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database(process.env.DB_FILE || "database.db");
setupDB(db, process.env.DEFAULT_USER, process.env.DEFAULT_PASSWORD);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: { maxAge: 24 * 60 * 60 * 1000 } }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');




const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 2, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
});
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
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


app.listen(port, () => {
    console.log(`Server is listening at port: http://localhost:${port}`);
});

