"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAboutMessages = exports.randomProperty = exports.deleteSelectedMessagesFromDatabase = exports.getSelectedMessagesFromDatabase = exports.setupDB = exports.validateContactForm = exports.dict = void 0;
const axios_1 = __importDefault(require("axios"));
const data_source_1 = require("./data-source");
const Message_1 = require("./entity/Message");
const User_1 = require("./entity/User");
const typeorm_1 = require("typeorm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.dict = {
    "PL": {
        allFieldsRequired: "Wszystkie pola są wymagane",
        incorrectEmail: "Nieprawidłowy adres email",
        incorrectPhoneNumber: "Nieprawidłowy numer telefonu",
        incorrectCaptcha: "Weryfikacja hCaptcha nie powiodła się. Spróbuj ponownie.",
        errorCaptcha: "Wystąpił błąd podczas weryfikacji hCaptcha."
    }
};
const validateContactForm = (body, language, captchaSecretKey) => __awaiter(void 0, void 0, void 0, function* () {
    let { firstName, phoneNumber, email, city, message, consent } = body;
    const hcaptchaResponse = body["g-recaptcha-response"];
    const response = {
        isValid: true,
        errorMessages: []
    };
    if (!firstName || !phoneNumber || !email || !city || !message || consent != "on") {
        response.isValid = false;
        response.errorMessages.push(exports.dict[language].allFieldsRequired);
        return response;
    }
    const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
    const emailExpresion = new RegExp(emailRegex);
    if (!email.match(emailExpresion)) {
        response.isValid = false;
        response.errorMessages.push(exports.dict[language].incorrectEmail);
    }
    const phoneRegex = /^[\d\s\-()+]+$/;
    if (!phoneRegex.test(phoneNumber) || phoneNumber.length < 6) {
        response.isValid = false;
        response.errorMessages.push(exports.dict[language].incorrectPhoneNumber);
    }
    if (process.env.NODE_ENV === "production") {
        try {
            const params = new URLSearchParams();
            params.append("response", hcaptchaResponse);
            params.append("secret", captchaSecretKey);
            const verificationResponse = yield axios_1.default.post('https://hcaptcha.com/siteverify', params);
            if (!verificationResponse.data.success) {
                response.isValid = false;
                response.errorMessages.push(exports.dict[language].incorrectCaptcha);
            }
        }
        catch (error) {
            response.isValid = false;
            response.errorMessages.push(exports.dict[language].errorCaptcha);
            console.log(error);
        }
    }
    return response;
});
exports.validateContactForm = validateContactForm;
const setupDB = (username, password, hashRounds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = (yield data_source_1.AppDataSource).getRepository(User_1.User);
        // Create tables if they don't exist
        yield (yield data_source_1.AppDataSource).synchronize();
        // Check if any user exists
        const isUser = yield userRepository.find();
        // If no user exists, create a default user
        const hashedPassword = yield bcrypt_1.default.hash(password, hashRounds);
        if (isUser.length === 0) {
            console.log(isUser);
            const newUser = userRepository.create({
                username: username,
                password: hashedPassword,
            });
            yield userRepository.save(newUser);
        }
    }
    catch (error) {
        console.error('Error occurred during database setup:', error);
        throw error;
    }
});
exports.setupDB = setupDB;
const getSelectedMessagesFromDatabase = (selectedMessageIds) => __awaiter(void 0, void 0, void 0, function* () {
    const messageRepository = (yield data_source_1.AppDataSource).getRepository(Message_1.Message);
    try {
        // Retrieve messages based on their IDs
        const selectedMessages = yield messageRepository.findBy({ id: (0, typeorm_1.In)(selectedMessageIds) });
        if (selectedMessages && selectedMessages.length > 0) {
            return selectedMessages;
        }
        else {
            throw new Error('No messages found with the provided IDs.');
        }
    }
    catch (error) {
        console.error('Error occurred while retrieving messages from the database:', error);
        throw error;
    }
});
exports.getSelectedMessagesFromDatabase = getSelectedMessagesFromDatabase;
const deleteSelectedMessagesFromDatabase = (selectedMessageIds) => __awaiter(void 0, void 0, void 0, function* () {
    const messageRepository = (yield data_source_1.AppDataSource).getRepository(Message_1.Message);
    try {
        const deleteResult = yield messageRepository.delete({ id: (0, typeorm_1.In)(selectedMessageIds) });
        if (deleteResult.affected && deleteResult.affected > 0) {
            console.log('Messages successfully deleted from the database.');
        }
        else {
            throw new Error('No messages were deleted. Check the provided IDs.');
        }
    }
    catch (error) {
        console.error('Error occurred while deleting messages from the database:', error);
        throw error;
    }
});
exports.deleteSelectedMessagesFromDatabase = deleteSelectedMessagesFromDatabase;
const randomProperty = (obj) => {
    let keys = Object.keys(obj);
    return obj[keys[keys.length * Math.random() << 0]];
};
exports.randomProperty = randomProperty;
const notifyAboutMessages = (transporter, newMessages) => __awaiter(void 0, void 0, void 0, function* () {
    let text = "nowych wiadomości";
    if (newMessages.length == 1) {
        text = "nową wiadomość";
    }
    else if (newMessages.length < 5) {
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
    const plainTextMessages = [];
    const htmlMessages = [];
    for (let index = 0; index < newMessages.length; index++) {
        const currentMessage = newMessages[index];
        const plainTextMessage = `
            Wiadomość nr ${index + 1}
            Dane klienta: ${currentMessage.firstName} ${currentMessage.lastName}
        Nr telefonu: ${currentMessage.phoneNumber}
        Adres: ${currentMessage.city}, ${currentMessage.street} ${currentMessage.homeNumber}
        Treść wiadomości:
        ${currentMessage.message}
        `;
        const htmlMessage = `
            <h1>Wiadomość nr ${index + 1}</h1>
            <h2>Dane klienta:</h2>
            <ul>
                <li>🗄️ Dane klienta: ${currentMessage.firstName} ${currentMessage.lastName}</li>
                <li>☎️ Nr telefonu: ${currentMessage.phoneNumber}</li>
                <li>🏡 Adres: ${currentMessage.city}, ${currentMessage.street} ${currentMessage.homeNumber}</li>
            </ul>
            <h2>ℹ️ Treść wiadomości:</h2>
            <p>${currentMessage.message}</p>
    `;
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
    yield transporter.sendMail(emailObject).then((x) => {
        console.log("Pomyślnie wysłano powiadomienie o nowych wiadomościach");
    }).catch((err) => { console.error(err); });
});
exports.notifyAboutMessages = notifyAboutMessages;
