const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const { validateContactForm, setupDB, getAsync, randomProperty, notifyAboutMessages } = require("./utils.js")
require('dotenv').config()
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { rateLimit } = require('express-rate-limit')
const axios = require("axios");
const nodemailer = require("nodemailer");



const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database(process.env.DB_FILE || "database.db");
const dashboardRoutes = require("./routes/dashboardRoutes.js")(db)



setupDB(db, process.env.DEFAULT_USER, process.env.DEFAULT_PASSWORD);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: { maxAge: 24 * 60 * 60 * 1000 } }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('trust proxy', 1)

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: (process.env.EMAIL_SECURE == "TRUE" ? true : false),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 2, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
});

const otomotoData = {
    url: "https://www.otomoto.pl/api/open",
    otomoto_access_token: null,
    otomoto_token_expires: 0
}

let newMessages = 0;
async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}
const checkForMessages = (async () => {
    while (true) {
        await delay(1 * 1 * 1000);
        if (newMessages == 0) {
            continue;
        } else {
            await notifyAboutMessages(transporter, newMessages)
            newMessages = 0;
        }
    }

})
checkForMessages();



app.use("/", express.static("static"));

app.use("/dashboard", dashboardRoutes);



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
    newMessages++;
    res.send(response);
    res.end();
});

app.get("/api/get-listings", async (req, res) => {
    const placeholder = [
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
    ];

    if (!otomotoData.access_token || otomotoData.expires < Date.now()) {
        const url = otomotoData.url + "/oauth/token";

        const body = new URLSearchParams({
            client_id: process.env.OTOMOTO_CLIENT_ID,
            client_secret: process.env.OTOMOTO_CLIENT_SECRET,
            grant_type: "password",
            username: process.env.OTOMOTO_USERNAME,
            password: process.env.OTOMOTO_PASSWORD
        }).toString();


        const response = await axios.post(url, body)
        if (response.data.access_token && response.data.expires_in) {
            otomotoData.access_token = response.data.access_token;
            otomotoData.expires_in = Date.now() + (response.data.expires_in * 1000);
        } else {
            return res.json(placeholder);
        }
    }
    const url = otomotoData.url + "/account/adverts";
    const config = {
        headers: {
            Authorization: `Bearer ${otomotoData.access_token}`,
            "User-Agent": process.env.USERNAME,
            "Content-Type": "application/json"
        }
    }
    const advertsList = await axios.get(url, config);
    if (advertsList.data.results.length == 0) {
        return res.json(placeholder);
    }
    const response = [];
    await advertsList.data.results.forEach(async (auction) => {
        if (auction.status != "active") {
            return;
        }
        const url = otomotoData.url + `/account/adverts/${auction.id}`;
        const auctionData = await axios.get(url, config);
        const temp = {
            title: auctionData.data.title,
            href: auctionData.data.url,
            price: auctionData.data.params.price["1"],
            year: 0,
            src: auctionData.data.photos["1"][randomProperty(auctionData.data.photos["1"])]
        }

        response.push(temp);
    });

    res.json(response);
})



app.listen(port, () => {
    console.log(`Server is listening at port: http://localhost:${port}`);
});

