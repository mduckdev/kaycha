
import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Message } from '../../entity/Message';
import { notifyAboutMessages, validateContactForm } from '../../utils';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import nodemailer from 'nodemailer';

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

let newMessages: Message[] = [];
async function delay(ms: number): Promise<void> {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}
const checkForMessages = (async (): Promise<void> => {
    while (true) {
        await delay(15 * 60 * 1000); // x minutes * 60 seconds * 1000 miliseconds
        if (newMessages.length == 0) {
            continue;
        } else {
            await notifyAboutMessages(transporter, newMessages)
            newMessages = [];
        }
    }

});
if (process.env.NODE_ENV !== 'test') {
    checkForMessages();
}

export const contactController = async (req: Request, res: Response): Promise<Response> => {
    const { firstName, lastName = "", phoneNumber, email, city, street = "", homeNumber = "", message } = req.body;
    const response = await validateContactForm(req.body, "PL", process.env.HCAPTCHA_PRIVATE_KEY || "");
    const { isValid } = response;
    const clientIP = req?.header('x-forwarded-for')?.split(",")[0] ||
        req.socket.remoteAddress;
    const clientPort = req.socket.remotePort;
    if (!isValid) {
        return res.status(400).json(response);
    }
    const timestamp = Date.now();

    try {
        const messageRepository = (await AppDataSource).getRepository(Message);
        const newMessage = messageRepository.create({
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            email: email,
            city: city,
            street: street,
            homeNumber: homeNumber,
            message: message,
            ipAddress: clientIP,
            timestamp: timestamp,
            portNumber: clientPort
        });
        await messageRepository.save(newMessage);
        console.log(`Successfully added new message to the database from: ${firstName}`);
        newMessages.push(newMessage);
    } catch (error) {
        console.error('Error occurred while adding message to the database:', error);
        throw error;
    }
    return res.json(response);
}