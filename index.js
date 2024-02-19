const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const { validateContactForm, setupDB, getAsync } = require("./utils.js")
require('dotenv').config()
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { rateLimit } = require('express-rate-limit')

//const flash = require('connect-flash');
const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database(process.env.DB_FILE || "database.db");
setupDB(db, process.env.DEFAULT_USER, process.env.DEFAULT_PASSWORD);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
//app.use(flash());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    async (username, password, done) => {
        const user = await getAsync("SELECT * FROM users WHERE username=?", [username], db);
        const hashedPassword = user?.password || "";
        if (user && bcrypt.compareSync(password, hashedPassword)) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Invalid username or password' });
        }
    }
));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await getAsync("SELECT * FROM users WHERE id=?", [id], db);
    done(null, user);
});

const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 2, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
})




app.use("/", express.static("static"));


app.get('/login', (req, res) => {

    res.send('<h1>Login Page</h1><form action="/login" method="post"><input type="text" name="username" placeholder="Username" required><br><input type="password" name="password" placeholder="Password" required><br><button type="submit">Login</button></form>');
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: false
}));
app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
        res.end();
        return;
    }
    const searchQuery = req.query.search || '';
    const sortBy = req.query.sortBy || 'id';
    const sortDirection = req.query.sortDirection || 'desc'; // Domyślnie malejąco
    // Zapytanie SQL z uwzględnieniem warunków wyszukiwania i sortowania
    const sql = `SELECT * FROM messages
               WHERE firstName LIKE '%${searchQuery}%' OR
                     lastName LIKE '%${searchQuery}%' OR
                     phoneNumber LIKE '%${searchQuery}%' OR
                     email LIKE '%${searchQuery}%' OR
                     city LIKE '%${searchQuery}%' OR
                     street LIKE '%${searchQuery}%' OR
                     homeNumber LIKE '%${searchQuery}%' OR
                     message LIKE '%${searchQuery}%'
               ORDER BY ${sortBy} ${sortDirection}`;
    // Wykonaj zapytanie do bazy danych
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Wystąpił błąd podczas pobierania wiadomości.');
        }

        // Renderuj widok EJS, przekazując dane wiadomości
        res.render('dashboard', { messages: rows });
    });



});
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send("Error while logging out");
        }
        res.redirect('/');
    });
});

app.use("/api/contact", limiter);
app.post("/api/contact", async (req, res) => {
    const { firstName, lastName, phoneNumber, email, city, street, homeNumber, message } = req.body;
    const response = await validateContactForm(req.body, "PL", process.env.HCAPTCHA_PRIVATE_KEY);
    const { isValid } = response;
    const clientIP = req.header('x-forwarded-for').split(",")[0] ||
        req.socket.remoteAddress;
    const clientPort = req.socket.remotePort;
    if (!isValid) {
        res.send(JSON.stringify(response));
        res.end();
        return;
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

})
app.delete('/delete-message/:id', (req, res) => {
    const messageId = req.params.id;
    if (!req.isAuthenticated()) {
        res.redirect("/login");
        res.end();
        return;
    }

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
app.get('/message-details/:id', (req, res) => {
    const messageId = req.params.id;
    if (!req.isAuthenticated()) {
        res.redirect("/login");
        res.end();
        return;
    }
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


app.listen(port, () => {
    console.log(`Server is listening at port: http://localhost:${port}`);
});

