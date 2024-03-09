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

dotenv.config()

const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.user?.id) {
        return res.redirect('/login');
    } else {
        next();
    }
};


export function dashboardRoutes(): Router {
    const router = express.Router();
    router.use(requireAuth);
    router.get('/', dashboardController);

    router.delete('/delete-message/:id', deleteMessageController);

    router.get('/send-message/:id', sendMessageController);

    router.get('/message-details/:id', messageDetailsController);

    router.get("/profile", profileController);

    router.post("/change-profile", changeProfileController);

    router.post('/export-messages-csv', exportMessagesCsvController);

    router.post('/export-messages-eml', exportMessagesEmlController);

    router.delete('/delete-messages', deleteMessagesController);

    return router;
}