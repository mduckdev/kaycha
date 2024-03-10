import axios from "axios";
import { ContactResponseI } from "./interfaces/responses"
import { AppDataSource } from "./data-source";
import { Message } from "./entity/Message";
import { User } from "./entity/User";
import { In } from "typeorm";
import { DictionaryI } from "./interfaces/data";
import bcrypt from "bcrypt";
import dotenv from "dotenv"
dotenv.config();


export const dict: DictionaryI = {
    "PL": {
        allFieldsRequired: "Wszystkie pola są wymagane",
        incorrectEmail: "Nieprawidłowy adres email",
        incorrectPhoneNumber: "Nieprawidłowy numer telefonu",
        incorrectCaptcha: "Weryfikacja hCaptcha nie powiodła się. Spróbuj ponownie.",
        errorCaptcha: "Wystąpił błąd podczas weryfikacji hCaptcha."
    }
};


export const validateContactForm = async (body: any, language: string, captchaSecretKey: string): Promise<ContactResponseI> => {
    let { firstName, phoneNumber, email, city, message, consent } = body;
    const hcaptchaResponse = body["g-recaptcha-response"];

    const response: ContactResponseI = {
        isValid: true,
        errorMessages: []
    };

    if (!firstName || !phoneNumber || !email || !city || !message || consent != "on") {
        response.isValid = false;
        response.errorMessages.push(dict[language].allFieldsRequired);
        return response;
    }

    const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
    const emailExpresion = new RegExp(emailRegex);
    if (!email.match(emailExpresion)) {
        response.isValid = false;
        response.errorMessages.push(dict[language].incorrectEmail);
    }

    const phoneRegex = /^[\d\s\-()+]+$/;
    if (!phoneRegex.test(phoneNumber) || phoneNumber.length < 6) {
        response.isValid = false;
        response.errorMessages.push(dict[language].incorrectPhoneNumber);
    }

    if (process.env.NODE_ENV === "production") {
        try {
            const params = new URLSearchParams();
            params.append("response", hcaptchaResponse);
            params.append("secret", captchaSecretKey);

            const verificationResponse = await axios.post('https://hcaptcha.com/siteverify', params);

            if (!verificationResponse.data.success) {
                response.isValid = false;
                response.errorMessages.push(dict[language].incorrectCaptcha);
            }
        } catch (error) {
            response.isValid = false;
            response.errorMessages.push(dict[language].errorCaptcha);
            console.log(error);
        }
    }


    return response;
};

export const setupDB = async (username: string, password: string, hashRounds: number): Promise<void> => {
    try {

        const userRepository = (await AppDataSource).getRepository(User);

        // Create tables if they don't exist
        await (await AppDataSource).synchronize()


        // Check if any user exists
        const isUser = await userRepository.find();
        // If no user exists, create a default user
        const hashedPassword = await bcrypt.hash(password, hashRounds);
        if (isUser.length === 0) {
            console.log(isUser);
            const newUser = userRepository.create({
                username: username,
                password: hashedPassword,
            });
            await userRepository.save(newUser);
        }

    } catch (error) {
        console.error('Error occurred during database setup:', error);
        throw error;
    }
};

export const getSelectedMessagesFromDatabase = async (selectedMessageIds: number[]): Promise<any> => {


    const messageRepository = (await AppDataSource).getRepository(Message);

    try {
        // Retrieve messages based on their IDs
        const selectedMessages = await messageRepository.findBy({ id: In(selectedMessageIds) });

        if (selectedMessages && selectedMessages.length > 0) {
            return selectedMessages;
        } else {
            throw new Error('No messages found with the provided IDs.');
        }
    } catch (error) {
        console.error('Error occurred while retrieving messages from the database:', error);
        throw error;
    }
};

export const deleteSelectedMessagesFromDatabase = async (selectedMessageIds: number[]): Promise<void> => {
    const messageRepository = (await AppDataSource).getRepository(Message);

    try {
        const deleteResult = await messageRepository.delete({ id: In(selectedMessageIds) });

        if (deleteResult.affected && deleteResult.affected > 0) {
            console.log('Messages successfully deleted from the database.');
        } else {
            throw new Error('No messages were deleted. Check the provided IDs.');
        }
    } catch (error) {
        console.error('Error occurred while deleting messages from the database:', error);
        throw error;
    }
};

export const randomProperty = (obj: any): any => {
    let keys = Object.keys(obj);
    return obj[keys[keys.length * Math.random() << 0]];
};

export const notifyAboutMessages = async (transporter: any, newMessages: Message[]): Promise<void> => {
    let text = "nowych wiadomości";
    if (newMessages.length == 1) {
        text = "nową wiadomość";
    } else if (newMessages.length < 5) {
        text = "nowe wiadomości";
    }
    const plainTextMessage = `Masz ${newMessages.length} ${text}!`;
    const htmlMessage = `
    <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                }
        
                h2 {
                    color: #007bff;
                }
        
                ul {
                    list-style-type: none;
                    padding: 0;
                }
        
                li {
                    margin-bottom: 10px;
                }
        
                p {
                    margin-top: 0;
                }
            </style>
    <h1>ℹ️ Masz ${newMessages.length} ${text}!</h1><br>
    `;
    const plainTextMessages: string[] = []
    const htmlMessages: string[] = []
    for (let index = 0; index < newMessages.length; index++) {
        const currentMessage = newMessages[index];
        const plainTextMessage =
            `
            Wiadomość nr ${index + 1}
            Dane klienta: ${currentMessage.firstName} ${currentMessage.lastName}
        Nr telefonu: ${currentMessage.phoneNumber}
        Adres: ${currentMessage.city}, ${currentMessage.street} ${currentMessage.homeNumber}
        Treść wiadomości:
        ${currentMessage.message}
        `;
        const htmlMessage =
            `
            <h1>Wiadomość nr ${index + 1}</h1>
            <h2>Dane klienta:</h2>
            <ul>
                <li>🗄️ Dane klienta: ${currentMessage.firstName} ${currentMessage.lastName}</li>
                <li>☎️ Nr telefonu: ${currentMessage.phoneNumber}</li>
                <li>🏡 Adres: ${currentMessage.city}, ${currentMessage.street} ${currentMessage.homeNumber}</li>
            </ul>
            <h2>ℹ️ Treść wiadomości:</h2>
            <p>${currentMessage.message}</p>
    `
        plainTextMessages.push(plainTextMessage);
        htmlMessages.push(htmlMessage);
    }
    const emailObject = {
        from: `"System powiadomień" <${process.env.EMAIL_USER_ADDRESS}>`, // sender address
        to: process.env.EMAIL_DESTINATION, // list of receivers
        subject: `Masz ${newMessages.length} ${text}`, // Subject line
        text: (plainTextMessage + plainTextMessages.join("\n")), // plain text body
        html: (htmlMessage + htmlMessages.join("<br>")), // html body
    };

    await transporter.sendMail(emailObject).then((x: any) => {
        console.log("Pomyślnie wysłano powiadomienie o nowych wiadomościach");
    }).catch((err: any) => { console.error(err); });
};
