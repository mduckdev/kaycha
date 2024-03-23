import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { setupDB } from "./utils"
import dotenv from 'dotenv';
import path from 'path';
import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { dashboardRoutes } from "./routes/dashboardRoutes"
import helmet from "helmet";
import "reflect-metadata";
import { apiRoutes } from './routes/apiRoutes';
import ExpressSession from 'express-session';
import { TypeormStore } from "connect-typeorm";
import { Session } from './entity/Session';
import { authRoutes } from './routes/authRoutes';


declare module "express-session" {
    interface SessionData {
        user: User;
        csrfToken: string | null;
        lastGeneratedMfaSecret: string | null
    }
}

dotenv.config();

export const bootstrap = async () => {
    const app = express();
    const port: number = Number(process.env.PORT) || 3000;

    if (process.env.NODE_ENV !== 'test') {
        setupDB(process.env.DEFAULT_USER || "", process.env.DEFAULT_PASSWORD || "", Number(process.env.PASSWORD_HASH_ROUND) || 10);
    }

    app.disable("x-powered-by");
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());


    const sessionRepository = (await AppDataSource).getRepository(Session);
    app.use(ExpressSession({
        secret: process.env.SESSION_SECRET || "cvsn4qrqjN6AbSwmIptfTXwbBkmrTq9SuvJkgqFKvTHUFQNcGLypOIrivgY0ns4N",
        name: "sessionID",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "strict",
            secure: (process.env.NODE_ENV == "production") ? true : false,
            httpOnly: true,
        },
        store: new TypeormStore({ cleanupLimit: 2 }).connect(sessionRepository)
    }))

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                "script-src": ["'self'", "https://code.jquery.com", "https://cdn.jsdelivr.net", "https://stackpath.bootstrapcdn.com", "https://cdnjs.cloudflare.com", "https://*.hcaptcha.com", "https://hcaptcha.com"],
                "style-src": ["'self'", "https://stackpath.bootstrapcdn.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://*.hcaptcha.com", "https://hcaptcha.com", "https://fonts.googleapis.com"],
                "font-src": ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
                "img-src": ["'self'", "https://*.olxcdn.com", "https://cdnjs.cloudflare.com", "data:"],
                "frame-src": ["https://*.hcaptcha.com", "https://hcaptcha.com", "https://maps.googleapis.com"],
                "connect-src": ["'self'", "https://*.hcaptcha.com", "https://hcaptcha.com"]
            }
        },

    }))


    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.set('trust proxy', 1)




    app.use("/", express.static("static"));
    app.use("/dashboard", dashboardRoutes());
    app.use("/api", apiRoutes());
    app.use("/auth", authRoutes());



    if (process.env.NODE_ENV !== 'test') {
        app.listen(port, () => {
            console.log(`Server is running at: http://localhost:${port}`);
        });
    }
    return app;
}
bootstrap();

