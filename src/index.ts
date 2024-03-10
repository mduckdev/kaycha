import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from "bcrypt";
import { setupDB } from "./utils"
import dotenv from 'dotenv';
import session from 'express-session';
import path from 'path';
import { rateLimit } from 'express-rate-limit'
import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { dashboardRoutes } from "./routes/dashboardRoutes"

import "reflect-metadata";
import { apiRoutes } from './routes/apiRoutes';

declare module "express-session" {
    interface SessionData {
        user: User;
    }
}

dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 3000;

setupDB(process.env.DEFAULT_USER || "", process.env.DEFAULT_PASSWORD || "", Number(process.env.PASSWORD_HASH_ROUND) || 10);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: process.env.SESSION_SECRET || "cvsn4qrqjN6AbSwmIptfTXwbBkmrTq9SuvJkgqFKvTHUFQNcGLypOIrivgY0ns4N", resave: false, saveUninitialized: false, cookie: { maxAge: 24 * 60 * 60 * 1000 } }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('trust proxy', 1)

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
});


app.use("/", express.static("static"));

app.use("/dashboard", dashboardRoutes());
app.use("/api", apiRoutes());


app.get('/login', (req: Request, res: Response): void => {
    res.render("login");
});
app.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
    const { username = "", password = "" }: { username: string, password: string } = req.body;

    try {
        // Get repository for User entity

        const userRepository = (await AppDataSource).getRepository(User);

        // Retrieve user from the database by username
        const user = await userRepository.findOneBy({ "username": username });
        // Check if the user exists and the password is correct
        if (user && bcrypt.compareSync(password, user.password)) {
            console.log(`Successfull login for user ${user.username} from ${req?.header('x-forwarded-for')?.split(",")[0] || req.socket.remoteAddress}:${req.socket.remotePort}`)
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
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running at: http://localhost:${port}`);
    });
}


export default app;