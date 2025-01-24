import express, { Request, Response, Router } from 'express';
import "reflect-metadata"
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit'
import { assureCSRF, verifyCSRF } from '../utils';
import { Fleet } from '../controllers/fleet/fleet';


dotenv.config()

const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session?.user?.id) {
        return res.redirect("/auth/login");
    } else {
        next();
    }
};
const dashboardLimiter = rateLimit({
    windowMs: 1 * 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
});


export function fleetRoutes(): Router {
    const router = express.Router();
    router.use(requireAuth);
    router.use(dashboardLimiter);
    router.use(assureCSRF);
    router.use(verifyCSRF);

    router.get("/", new Fleet().getIndex)
    router.get("/edit/:id", new Fleet().getEdit)
    router.get("/add", new Fleet().getAdd)

    router.put('/add', new Fleet().put);

    router.patch('/edit/:id', new Fleet().patch);

    router.delete("/delete/:id", new Fleet().delete)

    return router;
}