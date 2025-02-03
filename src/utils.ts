import axios from "axios";
import { ContactResponseI } from "./interfaces/responses"
import { AppDataSource } from "./data-source";
import { Message } from "./entity/Message";
import { User } from "./entity/User";
import { In, Repository } from "typeorm";
import { DictionaryI } from "./interfaces/data";
import bcrypt from "bcrypt";
import dotenv from "dotenv"
import { Request, Response } from 'express';
import * as crypto from "crypto"
import { TransportMessage } from "./entity/TransportMessages";
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
    let { firstName, phoneNumber, email, city, message, consent, transport } = body;
    const hcaptchaResponse = body["g-recaptcha-response"];

    const response: ContactResponseI = {
        isValid: true,
        errorMessages: []
    };

    if (!firstName || !phoneNumber || !email || (!city && !transport) || !message || consent != "on") {
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

export const getSelectedMessagesFromDatabase = async (selectedMessageIds: number[],repository:Repository<Message> | Repository<TransportMessage> ): Promise<any> => {



    try {
        // Retrieve messages based on their IDs
        const selectedMessages = await repository.findBy({ id: In(selectedMessageIds) });

        if (selectedMessages && selectedMessages.length > 0) {
            return selectedMessages;
        } else {
            console.error('No messages found with the provided IDs.');
        }
    } catch (error) {
        console.error('Error occurred while retrieving messages from the database:', error);
        throw error;
    }
};

export const deleteSelectedMessagesFromDatabase = async (selectedMessageIds: number[],repository:Repository<Message> | Repository<TransportMessage> ): Promise<void> => {

    try {
        const deleteResult = await repository.delete({ id: In(selectedMessageIds) });

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

export const notifyAboutMessages = async (transporter: any, newMessages: (Message|TransportMessage)[]): Promise<void> => {
    
   
    const machineMessages = newMessages.filter(x=>x instanceof Message);
    const TransportMessages = newMessages.filter(x=>x instanceof TransportMessage);


    const plainTextMachineMessages: string[] = [];
    const plainTextTransportMessages: string[] = [];

    const htmlMachineMessages: string[] = [];
    const htmlTransportMessages: string[] = [];
    let text = "nowych wiadomości";
    if (machineMessages.length == 1) {
        text = "nową wiadomość";
    } else if (machineMessages.length < 5) {
        text = "nowe wiadomości";
    }
    let plaintextHeader = `Masz ${machineMessages.length} ${text}!`;
    let htmlHeader = `
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
    <h1>ℹ️ Masz ${machineMessages.length} ${text}!</h1><br>
    `;
    plainTextMachineMessages.push(plaintextHeader);
    htmlMachineMessages.push(htmlHeader);
    for (let index = 0; index < machineMessages.length; index++){
        const currentMessage = machineMessages[index];
        
        if(currentMessage instanceof Message){
            let plainTextMessage =
            `
            Wiadomość nr ${index + 1}
            Dane klienta: ${currentMessage.firstName} ${currentMessage.lastName}
        Nr telefonu: ${currentMessage.phoneNumber}
        Adres: ${currentMessage.city}, ${currentMessage.street} ${currentMessage.homeNumber}
        Treść wiadomości:
        ${currentMessage.message}
        `;
        let htmlMessage =
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
        plainTextMachineMessages.push(plainTextMessage);
        htmlMachineMessages.push(htmlMessage);
    }
}
let emailObject = {
    from: `"System powiadomień" <${process.env.EMAIL_USER_ADDRESS}>`, // sender address
    to: "kontakt@kaczormaszyny.pl", // kontakt@kaczormaszyny.pl
    subject: `Nowe wiadomości kaczormaszyny.pl`, // Subject line
    text: (plainTextMachineMessages.join("\n")), // plain text body
    html: (htmlMachineMessages.join("<br>")), // html body
};

await transporter.sendMail(emailObject).then((x: any) => {
    console.log("Pomyślnie wysłano powiadomienie o nowych wiadomościach: kaczormaszyny.pl");
}).catch((err: any) => { console.error(err); });


     text = "nowych wiadomości";
    if (TransportMessages.length == 1) {
        text = "nową wiadomość";
    } else if (TransportMessages.length < 5) {
        text = "nowe wiadomości";
    }
     plaintextHeader = `Masz ${TransportMessages.length} ${text}!`;
 htmlHeader = `
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
<h1>ℹ️ Masz ${TransportMessages.length} ${text}!</h1><br>
`;
plainTextTransportMessages.push(plaintextHeader);
htmlTransportMessages.push(htmlHeader);
    for (let index = 0; index < TransportMessages.length; index++){
        const currentMessage = TransportMessages[index];
        
        if(currentMessage instanceof TransportMessage){
            let plainTextMessage=`
            Wiadomość nr ${index + 1}
            Dane klienta: ${currentMessage.firstName} ${currentMessage.lastName}
        Nr telefonu: ${currentMessage.phoneNumber}
        Adres załadunku: ${currentMessage.loadingAddress}
        Adres rozładunku: ${currentMessage.unloadingAddress}
        Treść wiadomości:
        ${currentMessage.message}
        `;
         let htmlMessage =
            `
            <h1>Wiadomość nr ${index + 1}</h1>
            <h2>Dane klienta:</h2>
            <ul>
                <li>🗄️ Dane klienta: ${currentMessage.firstName} ${currentMessage.lastName}</li>
                <li>☎️ Nr telefonu: ${currentMessage.phoneNumber}</li>
                <li>📦 Adres załadunku: ${currentMessage.loadingAddress}</li>
                <li>🚚 Adres rozładunku: ${currentMessage.unloadingAddress}</li>
            </ul>
            <h2>ℹ️ Treść wiadomości:</h2>
            <p>${currentMessage.message}</p>
    `
    plainTextTransportMessages.push(plainTextMessage);
    htmlTransportMessages.push(htmlMessage);
        }
    }
     emailObject = {
        from: `"System powiadomień" <${process.env.EMAIL_USER_ADDRESS}>`, // sender address
        to: "kontakt@kaczortransport.pl", // kontakt@kaczortransport.pl
        subject: `Nowe wiadomości kaczortransport.pl`, // Subject line
        text: (plainTextTransportMessages.join("\n")), // plain text body
        html: (htmlTransportMessages.join("<br>")), // html body
    };

    await transporter.sendMail(emailObject).then((x: any) => {
        console.log("Pomyślnie wysłano powiadomienie o nowych wiadomościach: kaczortransport.pl");
    }).catch((err: any) => { console.error(err); });

    
};
const generateCSRFToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                const token = buffer.toString('hex');
                resolve(token);
            }
        });
    });
}
export const verifyCSRF = async (req: Request, res: Response, next: Function) => {
    const { csrfToken }: { csrfToken: string } = req.body;
    const sessionCSRFToken = req.session?.csrfToken;
    if (req.method === "GET") {
        next();
    } else if (csrfToken === sessionCSRFToken && csrfToken != "" && sessionCSRFToken != "") {
        next();
    } else {
        res.status(400).send("Failed to verify csrf token.")
    }
}
export const assureCSRF = async (req: Request, res: Response, next: Function) => {
    const sessionCSRFToken = req.session?.csrfToken;
    if (!sessionCSRFToken) {
        req.session.csrfToken = await generateCSRFToken();
    }
    next();
}