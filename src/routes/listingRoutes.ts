import express, { Request, Response, Router } from 'express';
import "reflect-metadata"
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit'
import { assureCSRF, verifyCSRF } from '../utils';
import { logoutDevicesController } from '../controllers/dashboard/logoutDevices';
import { mfa } from '../controllers/dashboard/mfa';
import { listing } from '../controllers/listings/listing';


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


export function listingRoutes(): Router {
    const router = express.Router();
    router.use(requireAuth);
    router.use(dashboardLimiter);
    router.use(assureCSRF);
    router.use(verifyCSRF);

    router.get("/", new listing().getIndex)
    router.get("/edit/:id", new listing().getEdit)
    router.get("/add", new listing().getAdd)

    router.put('/add', new listing().put);

    router.patch('/edit/:id', new listing().patch);

    router.delete("/delete/:id", new listing().delete)

    return router;
}