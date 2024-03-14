import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from "bcrypt";
import { setupDB } from "./utils"
import dotenv from 'dotenv';
import path from 'path';
import { rateLimit } from 'express-rate-limit'
import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { dashboardRoutes } from "./routes/dashboardRoutes"
import helmet from "helmet";
import "reflect-metadata";
import { apiRoutes } from './routes/apiRoutes';
import ExpressSession from 'express-session';
import { TypeormStore } from "connect-typeorm";
import { Session } from './entity/Session';


declare module "express-session" {
    interface SessionData {
        user: User;
        csrfToken:string | null;
    }
}

dotenv.config();

export const bootstrap = async ()=>{
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
        name:"sessionID", 
        resave: false, 
        saveUninitialized: false, 
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, 
            sameSite: "strict", 
            secure: (process.env.NODE_ENV == "production") ? true : false, 
            httpOnly: true, 
        },
        store: new TypeormStore({cleanupLimit: 2}).connect(sessionRepository)
    }))
    
    app.use(helmet({
        contentSecurityPolicy:{
            directives:{
                "script-src":["'self'","https://code.jquery.com","https://cdn.jsdelivr.net","https://stackpath.bootstrapcdn.com","https://cdnjs.cloudflare.com","https://*.hcaptcha.com","https://hcaptcha.com"],
                "style-src":["'self'","https://stackpath.bootstrapcdn.com","https://cdn.jsdelivr.net","https://cdnjs.cloudflare.com","https://*.hcaptcha.com","https://hcaptcha.com","https://fonts.googleapis.com"],
                "font-src":["'self'","https://fonts.googleapis.com","https://fonts.gstatic.com"],
                "img-src":["'self'","https://*.olxcdn.com","https://cdnjs.cloudflare.com"],
                "frame-src":["https://*.hcaptcha.com","https://hcaptcha.com","https://maps.googleapis.com"],
                "connect-src":["'self'","https://*.hcaptcha.com","https://hcaptcha.com"]
            }
        },
        
    }))
    
    
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
    return app;
}
bootstrap();

