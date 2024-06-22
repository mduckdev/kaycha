import express, { Request, Response, Router } from 'express';
import "reflect-metadata"
import dotenv from 'dotenv';
import { dashboardController } from '../controllers/dashboard/dashboard';
import { deleteMessageController } from '../controllers/dashboard/deleteMessage';
import { sendMessageController } from '../controllers/dashboard/sendMessage';
import { messageDetailsController } from '../controllers/dashboard/messageDetails';
import { changeProfileController } from '../controllers/dashboard/changeProfile';
import { exportMessagesCsvController } from '../controllers/dashboard/exportMessagesCsv';
import { exportMessagesEmlController } from '../controllers/dashboard/exportMessagesEml';
import { deleteMessagesController } from '../controllers/dashboard/deleteMessages';
import { profileController } from '../controllers/dashboard/profile';
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

    router.get("/", new listing().get)


    return router;
}