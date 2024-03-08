import axios from "axios";
import { ContactResponseI } from "./interfaces/responses"
import { AppDataSource } from "./data-source";
import { Message } from "./entity/Message";
import { User } from "./entity/User";
import { In } from "typeorm";
interface Dictionary {
    [key: string]: {
        allFieldsRequired: string;
        incorrectEmail: string;
        incorrectPhoneNumber: string;
        incorrectCaptcha: string;
        errorCaptcha: string;
    };
}



export const dict: Dictionary = {
    "PL": {
        allFieldsRequired: "Wszystkie pola są wymagane",
        incorrectEmail: "Nieprawidłowy adres email",
        incorrectPhoneNumber: "Nieprawidłowy numer telefonu",
        incorrectCaptcha: "Weryfikacja hCaptcha nie powiodła się. Spróbuj ponownie.",
        errorCaptcha: "Wystąpił błąd podczas weryfikacji hCaptcha."
    }
};


export const validateContactForm = async (body: any, language: string, captchaSecretKey: string): Promise<ContactResponseI> => {
    let { firstName, lastName, phoneNumber, email, city, street, homeNumber, message, consent } = body;
    const hcaptchaResponse = body["g-recaptcha-response"];

    const response: ContactResponseI = {
        isValid: true,
        errorMessages: []
    };

    if (!firstName || !lastName || !phoneNumber || !email || !city || !street || !homeNumber || !message || consent != "on") {
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

    return response;
};

export const setupDB = async (username: string, password: string): Promise<void> => {
    try {
        const userRepository = await AppDataSource.initialize().then((x) => {
            return x.getRepository(User)
        });

        // Create tables if they don't exist
        await AppDataSource.synchronize()


        // Check if any user exists
        const isUser = await userRepository.find();
        // If no user exists, create a default user
        if (isUser.length === 0) {
            console.log(isUser);
            const newUser = userRepository.create({
                username: username,
                password: password,
            });
            await userRepository.save(newUser);
        }

    } catch (error) {
        console.error('Error occurred during database setup:', error);
        throw error;
    }
};

export const getSelectedMessagesFromDatabase = async (selectedMessageIds: number[]): Promise<any> => {
    const messageRepository = AppDataSource.getRepository(Message);

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
    const messageRepository = AppDataSource.getRepository(Message);

    try {
        // Delete messages based on their IDs
        const deleteResult = await messageRepository.delete({ id: In(selectedMessageIds) });

        // Check if any messages were deleted
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

export const notifyAboutMessages = async (transporter: any, newMessages: number): Promise<void> => {
    let text = "nowych wiadomości";
    if (newMessages == 1) {
        text = "nową wiadomość";
    } else if (newMessages < 5) {
        text = "nowe wiadomości";
    }
    const plainTextMessage =
        `Masz ${newMessages} ${text}!
        Odwiedź kaczormaszyny.pl/dashboard żeby je przejżeć.`;
    const htmlMessage =
        `
        <h1>ℹ️ Masz ${newMessages} ${text}!</h1><br>
        <h3>🔗Odwiedź <a href="https://kaczormaszyny.pl/dashboard">panel zarządzania</a> żeby je przejrzeć.</h3>
    `;
    const emailObject = {
        from: `"System powiadomień" <${process.env.EMAIL_USER_ADDRESS}>`, // sender address
        to: process.env.EMAIL_DESTINATION, // list of receivers
        subject: `Masz ${newMessages} ${text}`, // Subject line
        text: plainTextMessage, // plain text body
        html: htmlMessage, // html body
    };

    await transporter.sendMail(emailObject).then((x: any) => {
        console.log("Pomyślnie wysłano powiadomienie o nowych wiadomościach");
    }).catch((err: any) => { console.error(err); });
};
