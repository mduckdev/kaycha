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
const changeProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
    const updatedUser = yield userRepository.findOneBy({ id: (_b = req.session.user) === null || _b === void 0 ? void 0 : _b.id });
    if (!updatedUser) {
        return res.status(500).send('Nie można znaleźć zaktualizowanego użytkownika.');
    }
    req.session.user = updatedUser;
    res.redirect('/dashboard');
});
exports.changeProfileController = changeProfileController;
