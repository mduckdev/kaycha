const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const { validateContactForm, setupDB, getAsync } = require("./utils.js")
require('dotenv').config()
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const flash = require('connect-flash');
const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database(process.env.DB_FILE || "database.db");
setupDB(db, process.env.DEFAULT_USER, process.env.DEFAULT_PASSWORD);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());



// Konfiguracja strategii lokalnej
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

// Serializacja i deserializacja użytkownika
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await getAsync("SELECT * FROM users WHERE id=?", [id], db);
    done(null, user);
});




app.use("/", express.static("static"));


app.get('/login', (req, res) => {
    res.send('<h1>Login Page</h1><form action="/login" method="post"><input type="text" name="username" placeholder="Username" required><br><input type="password" name="password" placeholder="Password" required><br><button type="submit">Login</button></form>');
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));
app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`<h1>Hello, ${req.user.username}!</h1><a href="/logout">Logout</a>`);
    } else {
        res.redirect('/login');
    }
});
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send("Error while logging out");
        }
        res.redirect('/');
    });
});

app.post("/api/contact", async (req, res) => {
    const { firstName, lastName, phoneNumber, email, city, street, homeNumber, message } = req.body;
    const response = await validateContactForm(req.body, "PL", process.env.HCAPTCHA_PRIVATE_KEY);
    const { isValid, errorMessages } = response;

    if (!isValid) {
        res.send(JSON.stringify(response));
        res.end();
        return;
    }

    db.run("INSERT INTO messages(firstName,lastName,phoneNumber,email,city,street,homeNumber,message) VALUES (?,?,?,?,?,?,?,?)", [firstName, lastName, phoneNumber, email, city, street, homeNumber, message], function (err) {
        if (err) {
            console.log("Error occured while adding message to database: " + err);
        } {
            console.log("Successfuly added new message to database from: " + firstName);
        }
    })

    res.send(response);
    res.end();

})


app.listen(port, () => {
    console.log(`Server is listening at port: http://localhost:${port}`);
});

