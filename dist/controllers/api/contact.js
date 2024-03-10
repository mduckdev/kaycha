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
exports.contactController = void 0;
const data_source_1 = require("../../data-source");
const Message_1 = require("../../entity/Message");
const utils_1 = require("../../utils");
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporterOptions = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: (process.env.EMAIL_SECURE == "TRUE" ? true : false),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
};
const transporter = nodemailer_1.default.createTransport(transporterOptions);
let newMessages = [];
function delay(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        // return await for better async stack trace support in case of errors.
        return yield new Promise(resolve => setTimeout(resolve, ms));
    });
}
const checkForMessages = (() => __awaiter(void 0, void 0, void 0, function* () {
    while (true) {
        yield delay(15 * 60 * 1000); // x minutes * 60 seconds * 1000 miliseconds
        if (newMessages.length == 0) {
            continue;
        }
        else {
            yield (0, utils_1.notifyAboutMessages)(transporter, newMessages);
            newMessages = [];
        }
    }
}));
checkForMessages();
const contactController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { firstName, lastName = "", phoneNumber, email, city, street = "", homeNumber = "", message } = req.body;
    const response = yield (0, utils_1.validateContactForm)(req.body, "PL", process.env.HCAPTCHA_PRIVATE_KEY || "");
    const { isValid } = response;
    const clientIP = ((_a = req === null || req === void 0 ? void 0 : req.header('x-forwarded-for')) === null || _a === void 0 ? void 0 : _a.split(",")[0]) ||
        req.socket.remoteAddress;
    const clientPort = req.socket.remotePort;
    if (!isValid) {
        return res.status(400).json(response);
    }
    const timestamp = Date.now();
    try {
        const messageRepository = (yield data_source_1.AppDataSource).getRepository(Message_1.Message);
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
        yield messageRepository.save(newMessage);
        console.log(`Successfully added new message to the database from: ${firstName}`);
        newMessages.push(newMessage);
    }
    catch (error) {
        console.error('Error occurred while adding message to the database:', error);
        throw error;
    }
    return res.json(response);
});
exports.contactController = contactController;
