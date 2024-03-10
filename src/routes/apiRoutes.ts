import express, { Router } from 'express';
import "reflect-metadata"
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit'
import { contactController } from '../controllers/api/contact';
import { getListingsController } from '../controllers/api/getListings';

dotenv.config()

const contactLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
});

export function apiRoutes(): Router {
    const router = express.Router();
    router.post("/contact", contactLimiter, contactController);
    router.get("/get-listings", getListingsController);

    return router;
}