import { Request, Response } from 'express';
import crypto from "crypto"
import base32 from "hi-base32"
import * as OTPAuth from "otpauth";
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
async function generateTOTPSecret() {
    const secretLength: number = 16;
    const secret: Buffer = crypto.randomBytes(secretLength);
    const base32Secret: string = base32.encode(secret).replace(/=/g, '');;
    return base32Secret;
}
export class mfa {
    async get(req: Request, res: Response): Promise<void> {
        const secret = await generateTOTPSecret();
        let totp = new OTPAuth.TOTP({
            issuer: "Kaycha",
            label: req.session.user?.username,
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: secret, // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
        });
        req.session.lastGeneratedMfaSecret = secret;
        res.json({ uri: totp.toString() });
        return;
    }
    async post(req: Request, res: Response): Promise<void> {
        const { mfaToken = "" }: { mfaToken: string } = req.body;
        if (!req.session.lastGeneratedMfaSecret || !req.session.user) {
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
            const userRepository = (await AppDataSource).getRepository(User);
            const currentUser = await userRepository.findOneOrFail({ where: { id: req.session.user.id } });
            currentUser.mfaEnabled = true;
            currentUser.mfaSecret = req.session.lastGeneratedMfaSecret;
            await userRepository.save(currentUser);
            req.session.lastGeneratedMfaSecret = null;
        }
    }
}