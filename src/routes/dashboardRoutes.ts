import express, { Request, Response, Router } from 'express';
import { createObjectCsvWriter } from 'csv-writer';
import { promises as fs } from 'fs';
import { getSelectedMessagesFromDatabase, deleteSelectedMessagesFromDatabase } from '../utils';
import nodemailer from 'nodemailer';
import path from 'path';
import bcrypt from 'bcrypt';
import { MessageI, UserI } from '../interfaces/models';
import { Session, SessionData } from 'express-session';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AppDataSource } from '../data-source';
import { Message } from '../entity/Message';
import "reflect-metadata"
import { User } from '../entity/User';
import dotenv from 'dotenv';
import { dashboardController } from '../controllers/dashboard/dashboard';
import { deleteMessageController } from '../controllers/dashboard/deleteMessage';
import { sendMessageController } from '../controllers/dashboard/sendMessage';
import { messageDetailsController } from '../controllers/dashboard/messageDetails';
import { changeProfileController } from '../controllers/dashboard/changeProfile';
import { exportMessagesCsvController } from '../controllers/dashboard/exportMessagesCSV';
import { exportMessagesEmlController } from '../controllers/dashboard/exportMessagesEml';
import { deleteMessagesController } from '../controllers/dashboard/deleteMessages';

dotenv.config()
declare module "express-session" {
    interface SessionData {
        user: User;
    }
}


const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.user?.id) {
        return res.redirect('/login');
    } else {
        next();
    }
};

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



export function dashboardRoutes(): Router {
    const router = express.Router();
    router.use(requireAuth);
    router.get('/', async (req: Request, res: Response) => { dashboardController(req, res) });

    router.delete('/delete-message/:id', async (req: Request, res: Response) => { deleteMessageController(req, res) });

    router.get('/send-message/:id', async (req: Request, res: Response) => { sendMessageController(req, res, transporter) });

    router.get('/message-details/:id', async (req: Request, res: Response) => { messageDetailsController(req, res) });

    router.get("/profile", (req: Request, res: Response) => {
        res.render("profile", { user: req.session.user });
    });

    router.post("/change-profile", async (req: Request, res: Response) => { changeProfileController(req, res) });

    router.post('/export-messages-csv', async (req: Request, res: Response) => { exportMessagesCsvController(req, res) });

    router.post('/export-messages-eml', async (req: Request, res: Response) => { exportMessagesEmlController(req, res) });

    router.delete('/delete-messages', async (req: Request, res: Response) => { deleteMessagesController(req, res) });

    return router;
}