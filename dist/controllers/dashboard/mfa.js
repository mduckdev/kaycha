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
exports.mfa = void 0;
const crypto_1 = __importDefault(require("crypto"));
const hi_base32_1 = __importDefault(require("hi-base32"));
const OTPAuth = __importStar(require("otpauth"));
const data_source_1 = require("../../data-source");
const User_1 = require("../../entity/User");
function generateTOTPSecret() {
    return __awaiter(this, void 0, void 0, function* () {
        const secretLength = 16;
        const secret = crypto_1.default.randomBytes(secretLength);
        const base32Secret = hi_base32_1.default.encode(secret).replace(/=/g, '');
        ;
        return base32Secret;
    });
}
class mfa {
    get(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const secret = yield generateTOTPSecret();
            let totp = new OTPAuth.TOTP({
                issuer: "Kaycha",
                label: (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username,
                algorithm: "SHA1",
                digits: 6,
                period: 30,
                secret: secret, // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
            });
            req.session.lastGeneratedMfaSecret = secret;
            res.json({ uri: totp.toString() });
            return;
        });
    }
    post(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { mfaToken = "" } = req.body;
            if (!req.session.lastGeneratedMfaSecret || !req.session.user || mfaToken == "") {
                res.json({ success: false });
                return;
            }
            let totp = new OTPAuth.TOTP({
                issuer: "Kaycha",
                label: req.session.user.username,
                algorithm: "SHA1",
                digits: 6,
                period: 30,
                secret: req.session.lastGeneratedMfaSecret, // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
            });
            let token = totp.generate();
            if (mfaToken == token) {
                const userRepository = (yield data_source_1.AppDataSource).getRepository(User_1.User);
                const currentUser = yield userRepository.findOneOrFail({ where: { id: req.session.user.id } }).catch(e => console.error(e));
                if (!currentUser) {
                    res.json({ success: false });
                    return;
                }
                currentUser.mfaEnabled = true;
                currentUser.mfaSecret = req.session.lastGeneratedMfaSecret;
                yield userRepository.save(currentUser);
                req.session.lastGeneratedMfaSecret = null;
                req.session.user = currentUser;
                res.json({ success: true });
                return;
            }
            else {
                res.json({ success: false, message: "Invalid mfa code" });
                return;
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.user) {
                res.json({ success: false });
                return;
            }
            const userRepository = (yield data_source_1.AppDataSource).getRepository(User_1.User);
            const currentUser = yield userRepository.findOneOrFail({ where: { id: req.session.user.id, mfaEnabled: true } }).catch(e => console.error(e));
            if (!currentUser) {
                res.json({ success: false });
                return;
            }
            currentUser.mfaEnabled = false;
            currentUser.mfaSecret = null;
            yield userRepository.save(currentUser);
            req.session.user = currentUser;
            res.json({ success: true });
        });
    }
}
exports.mfa = mfa;
