"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.loginPostController = exports.loginController = void 0;
const data_source_1 = require("../../data-source");
const User_1 = require("../../entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const OTPAuth = __importStar(require("otpauth"));
const loginController = (req, res) => {
    res.render("login");
};
exports.loginController = loginController;
const loginPostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username = "", password = "", mfa = "" } = req.body;
    try {
        // Get repository for User entity
        const userRepository = (yield data_source_1.AppDataSource).getRepository(User_1.User);
        // Retrieve user from the database by username
        const user = yield userRepository.findOneBy({ "username": username });
        // Check if the user exists and the password is correct
        if (user && bcrypt_1.default.compareSync(password, user.password)) {
            console.log(`Successfull login for user ${user.username} from ${((_a = req === null || req === void 0 ? void 0 : req.header('x-forwarded-for')) === null || _a === void 0 ? void 0 : _a.split(",")[0]) || req.socket.remoteAddress}:${req.socket.remotePort}`);
            if (!user.mfaEnabled || !user.mfaSecret) {
                req.session.user = user;
                res.json({ success: true, message: "Successfull login" });
                return;
            }
            else {
                if (mfa === "") {
                    res.json({ success: false, message: "MFA required" });
                    return;
                }
                let totp = new OTPAuth.TOTP({
                    issuer: "Kaycha",
                    label: "Kaycha heavy equipment",
                    algorithm: "SHA1",
                    digits: 6,
                    period: 30,
                    secret: user.mfaSecret,
                });
                let token = totp.generate();
                if (token == mfa) {
                    req.session.user = user;
                    res.json({ success: true, message: "Successfull login" });
                    return;
                }
                else {
                    res.json({ success: false, message: "Invalid mfa code" });
                    return;
                }
            }
        }
        else {
            res.json({ success: false, message: "Nieprawidłowe dane do logowania" });
        }
    }
    catch (error) {
        console.error('Error occurred during login:', error);
        res.status(500).send('Internal Server Error').end();
    }
});
exports.loginPostController = loginPostController;
