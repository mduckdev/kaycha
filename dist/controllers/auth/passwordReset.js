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
exports.passwordReset = void 0;
const data_source_1 = require("../../data-source");
const User_1 = require("../../entity/User");
const crypto_1 = __importDefault(require("crypto"));
const ResetEmails_1 = require("../../entity/ResetEmails");
const typeorm_1 = require("typeorm");
const nodemailer_1 = __importDefault(require("nodemailer"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateToken = () => {
    return new Promise((resolve, reject) => {
        crypto_1.default.randomBytes(32, (err, buffer) => {
            if (err) {
                reject(null);
                console.error("Failed to generate recovery token, error: ", err);
            }
            else {
                const token = buffer.toString('hex');
                resolve(token);
            }
        });
    });
};
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
class passwordReset {
    get(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.render("password-reset");
        });
    }
    post(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            res.json({ success: true, message: "Sprawdź swoją skrzynkę mailową. Dostarczenie wiadomości może potrwać do kilku minut" });
            const { email } = req.body;
            console.log(`Password reset request for: ${email} from ${((_a = req === null || req === void 0 ? void 0 : req.header('x-forwarded-for')) === null || _a === void 0 ? void 0 : _a.split(",")[0]) || req.socket.remoteAddress}:${req.socket.remotePort}`);
            if (!email || email === "") {
                return;
            }
            const userRepository = (yield data_source_1.AppDataSource).getRepository(User_1.User);
            const user = yield userRepository.findBy({ email: email });
            if (user.length === 0) {
                return;
            }
            let failed = false;
            const token = yield generateToken().catch(err => { failed = true; });
            if (!token || failed) {
                return;
            }
            const dayInMs = 24 * 60 * 60 * 1000;
            const validDates = (Date.now()) - dayInMs;
            const resetEmailsRepository = (yield data_source_1.AppDataSource).getRepository(ResetEmails_1.ResetEmail);
            const validResetEmails = yield resetEmailsRepository.find({ where: { email: email, generatedAt: (0, typeorm_1.MoreThan)(validDates) } });
            if (validResetEmails.length >= 3) {
                return;
            }
            const newResetEmail = resetEmailsRepository.create({
                email: email,
                token: token
            });
            yield resetEmailsRepository.save(newResetEmail);
            const url = `https://kaczormaszyny.pl/auth/password-reset/confirm/${token}`;
            const plainTextMessage = `Resetowanie hasła

        W celu zresetowania hasła kliknij lub skopiuj poniższy link do przeglądarki:
        
            ${url}
        
        Jeśli nie prosiłeś o zresetowanie hasła, zignoruj tę wiadomość.
        Pozdrawiamy,
        Zespół Obsługi Klienta`;
            const htmlMessage = `<!DOCTYPE html>
        <html lang="pl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resetowanie hasła</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; color: #333;">Resetowanie hasła</h2>
            <p>W celu zresetowania hasła kliknij poniższy przycisk:</p>
            <p style="text-align: center;">
              <a href="${url}" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Resetuj hasło</a>
            </p>
            <p>Jeśli nie możesz kliknąć na przycisk, skopiuj i wklej poniższy link do przeglądarki:</p>
            <p style="background-color: #f7f7f7; padding: 10px; border-radius: 5px;"><a href="${url}" style="color: #333; text-decoration: none;">${url}</a></p>
            <p>Jeśli nie prosiłeś o zresetowanie hasła, zignoruj tę wiadomość.</p>
            <p>Pozdrawiamy,<br>Zespół Obsługi Klienta</p>
          </div>
        
        </body>
        </html>
        `;
            const emailObject = {
                from: `"Resetowanie hasła" <${process.env.EMAIL_USER_ADDRESS}>`, // sender address
                to: email, // list of receivers
                subject: `Link do zresetowania hasła`, // Subject line
                text: (plainTextMessage), // plain text body
                html: (htmlMessage), // html body
            };
            transporter.sendMail(emailObject);
        });
    }
    confirm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.params.token;
            if (!token || token === "") {
                return res.redirect("/auth/password-reset");
            }
            const dayInMs = 24 * 60 * 60 * 1000;
            const validDates = (Date.now()) - dayInMs;
            const resetEmailsRepository = (yield data_source_1.AppDataSource).getRepository(ResetEmails_1.ResetEmail);
            const resetEmails = yield resetEmailsRepository.find({ where: { token: token, generatedAt: (0, typeorm_1.MoreThan)(validDates), valid: true } });
            if (resetEmails.length !== 1) {
                return res.redirect("/auth/password-reset");
            }
            res.render("password-reset-confirm", { token: token });
        });
    }
    patch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.body.token;
            const newPassword = req.body.password;
            if (!token || token === "" || !newPassword || newPassword === "") {
                return res.redirect("/auth/password-reset");
            }
            const dayInMs = 24 * 60 * 60 * 1000;
            const validDates = (Date.now()) - dayInMs;
            const resetEmailsRepository = (yield data_source_1.AppDataSource).getRepository(ResetEmails_1.ResetEmail);
            const resetEmail = yield resetEmailsRepository.findOne({ where: { token: token, generatedAt: (0, typeorm_1.MoreThan)(validDates), valid: true } });
            if (!resetEmail) {
                return res.redirect("/auth/password-reset");
            }
            const userRepository = (yield data_source_1.AppDataSource).getRepository(User_1.User);
            const updatedUser = yield userRepository.findOne({ where: { email: resetEmail.email } });
            if (!updatedUser) {
                return res.redirect("/auth/password-reset");
            }
            updatedUser.password = yield bcrypt_1.default.hash(newPassword, (Number(process.env.PASSWORD_HASH_ROUND) || 10));
            yield userRepository.save(updatedUser);
            resetEmail.valid = false;
            yield resetEmailsRepository.save(resetEmail);
            res.json({ success: true, message: "Pomyślnie zresetowano hasło" });
        });
    }
}
exports.passwordReset = passwordReset;
