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
exports.changeProfileController = void 0;
const data_source_1 = require("../../data-source");
const User_1 = require("../../entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Session_1 = require("../../entity/Session");
const changeProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { newUsername = "", currentPassword = "", newPassword = "", newEmail = "" } = req.body;
    if (newUsername === "") {
        return res.status(401).send("Brakuje niezbędnych pól.");
    }
    const emailExpresion = new RegExp(/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/);
    if (!newEmail.match(emailExpresion) && newEmail != "") {
        return res.status(401).send("Nieprawidłowy email.");
    }
    const userRepository = (yield data_source_1.AppDataSource).getRepository(User_1.User);
    const currentUser = yield userRepository.findOneBy({ id: (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.id });
    if (!currentUser) {
        return res.status(500).send('Nie można znaleźć użytkownika.');
    }
    if (currentPassword !== "" && newPassword !== "") {
        if (!bcrypt_1.default.compareSync(currentPassword, currentUser.password)) {
            return res.status(401).send("Nieprawidłowe hasło.");
        }
        const hashedPassword = bcrypt_1.default.hashSync(newPassword, 10);
        currentUser.username = newUsername;
        currentUser.password = hashedPassword;
        currentUser.email = newEmail;
        try {
            const sessionRepository = (yield data_source_1.AppDataSource).getRepository(Session_1.Session);
            const sessions = yield sessionRepository.createQueryBuilder("sessions")
                .where("sessions.id != :id", { id: req.sessionID })
                .andWhere("sessions.json LIKE :userString", { userString: `%"username":"${(_b = req.session.user) === null || _b === void 0 ? void 0 : _b.username}"%` })
                .andWhere("sessions.destroyedAt IS NULL")
                .update()
                .set({ destroyedAt: new Date() })
                .execute();
            console.log(sessions);
        }
        catch (error) {
            res.json({ error: "Failed to logout from all devices after password change" });
        }
    }
    else {
        currentUser.username = newUsername;
        currentUser.email = newEmail;
    }
    try {
        yield userRepository.save(currentUser);
    }
    catch (updateErr) {
        console.error(updateErr);
        return res.status(500).send('Internal Server Error');
    }
    const updatedUser = yield userRepository.findOneBy({ id: (_c = req.session.user) === null || _c === void 0 ? void 0 : _c.id });
    if (!updatedUser) {
        return res.status(500).send('Nie można znaleźć zaktualizowanego użytkownika.');
    }
    req.session.user = updatedUser;
    res.redirect('/dashboard');
});
exports.changeProfileController = changeProfileController;
