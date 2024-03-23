import express, { Router } from 'express';
import "reflect-metadata"
import dotenv from 'dotenv';
import { assureCSRF, verifyCSRF } from '../utils';
import rateLimit from 'express-rate-limit';
import { loginController, loginPostController } from '../controllers/auth/login';
import { logoutController } from '../controllers/auth/logout';
import { passwordReset } from '../controllers/auth/passwordReset';
import { mfaController } from '../controllers/auth/mfa';


dotenv.config()
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, message: "Przekroczono limit zapytań. Proszę spróbować ponownie później." }
});
const passwordResetLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hour
    max: 5, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, message: "Przekroczono limit zapytań. Proszę spróbować ponownie później." }
});


export function authRoutes(): Router {
    const router = express.Router();
    //router.use(requireAuth);
    //router.use(dashboardLimiter);
    router.use(assureCSRF);

    router.get('/login', loginController);

    router.post('/login', loginLimiter, loginPostController);

    router.get('/logout', logoutController);

    router.get("/password-reset", new passwordReset().get);

    router.post("/password-reset", passwordResetLimiter, new passwordReset().post);

    router.get("/password-reset/confirm/:token", passwordResetLimiter, new passwordReset().confirm);

    router.patch("/password-reset", passwordResetLimiter, new passwordReset().patch);

    router.get("/add-mfa", passwordResetLimiter, mfaController);



    return router;
}