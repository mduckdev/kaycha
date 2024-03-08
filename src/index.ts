import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from "bcrypt";
import { validateContactForm, setupDB, randomProperty, notifyAboutMessages } from "./utils"
import dotenv from 'dotenv';
import session from 'express-session';
import sqlite3 from 'sqlite3';
import path from 'path';
import { rateLimit } from 'express-rate-limit'
import axios from "axios";
import nodemailer from "nodemailer";
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import { AppDataSource } from './data-source';
import { Message } from './entity/Message';
import { User } from './entity/User';
import { ListingsResponseI } from "./interfaces/responses"
import { otomotoDataI } from './interfaces/data';
import { dashboardRoutes } from "./routes/dashboardRoutes"

import "reflect-metadata";

declare module "express-session" {
    interface SessionData {
        user: User;
    }
}

dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 3000;
const db = new sqlite3.Database(process.env.DB_FILE || "database.db");
//const dashboardRoutes = require("./routes/dashboardRoutes")(db)

setupDB(process.env.DEFAULT_USER || "", process.env.DEFAULT_PASSWORD || "");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: process.env.SESSION_SECRET || "cvsn4qrqjN6AbSwmIptfTXwbBkmrTq9SuvJkgqFKvTHUFQNcGLypOIrivgY0ns4N", resave: false, saveUninitialized: false, cookie: { maxAge: 24 * 60 * 60 * 1000 } }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('trust proxy', 1)

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

const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 2, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
});




const otomotoData: otomotoDataI = {
    url: "https://www.otomoto.pl/api/open",
    access_token: null,
    expires: 0
}

let newMessages: number = 0;
async function delay(ms: number): Promise<void> {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}
const checkForMessages = (async (): Promise<void> => {
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

app.use("/dashboard", dashboardRoutes());



app.get('/login', (req: Request, res: Response): void => {
    res.render("login");
});
app.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    try {
        // Get repository for User entity
        const userRepository = AppDataSource.getRepository(User);

        // Retrieve user from the database by username
        const user = await userRepository.findOne({ where: { username: username } });

        // Check if the user exists and the password is correct
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
            return res.redirect('/dashboard');
        } else {
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Error occurred during login:', error);
        res.status(500).send('Internal Server Error').end();
    }
});


app.get('/logout', (req: Request, res: Response): void => {
    req.session.destroy((err) => {
        if (err) console.error(err)
        res.redirect("/");

    })
});
app.post("/api/contact", limiter, async (req: Request, res: Response): Promise<Response> => {
    const { firstName, lastName, phoneNumber, email, city, street, homeNumber, message } = req.body;
    const response = await validateContactForm(req.body, "PL", process.env.HCAPTCHA_PRIVATE_KEY || "");
    const { isValid } = response;
    const clientIP = req?.header('x-forwarded-for')?.split(",")[0] ||
        req.socket.remoteAddress;
    const clientPort = req.socket.remotePort;
    if (!isValid) {
        return res.send(JSON.stringify(response));
    }
    const timestamp = Date.now();

    try {

        // Get repository for Message entity
        const messageRepository = AppDataSource.getRepository(Message);

        // Create a new Message entity
        const newMessage = messageRepository.create({
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            email: email,
            city: city,
            street: street,
            homeNumber: homeNumber,
            message: message,
            ipAddress: clientIP,
            timestamp: timestamp,
            portNumber: clientPort
        });

        // Save the new Message to the database
        await messageRepository.save(newMessage);

        // Log success message
        console.log(`Successfully added new message to the database from: ${firstName}`);

    } catch (error) {
        console.error('Error occurred while adding message to the database:', error);
        throw error;
    }



    newMessages++;
    return res.send(response);
});

app.get("/api/get-listings", async (req: Request, res: Response): Promise<Response> => {
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
            client_id: process.env.OTOMOTO_CLIENT_ID || "",
            client_secret: process.env.OTOMOTO_CLIENT_SECRET || "",
            grant_type: "password",
            username: process.env.OTOMOTO_USERNAME || "",
            password: process.env.OTOMOTO_PASSWORD || ""
        }).toString();

        const response = await axios.post(url, body).catch(err => { console.error(err.data) });
        if (response?.data?.access_token && response?.data?.expires_in) {
            otomotoData.access_token = response.data.access_token;
            otomotoData.expires = Date.now() + (response.data.expires_in * 1000);
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

    const response: ListingsResponseI[] = [];
    await advertsList.data.results.forEach(async (auction: any) => {
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

    return res.json(response);
})



app.listen(port, () => {
    console.log(`Server is listening at port: http://localhost:${port}`);
});