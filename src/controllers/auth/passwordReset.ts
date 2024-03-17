import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import crypto from "crypto"
import { ResetEmail } from '../../entity/ResetEmails';
import { MoreThan } from 'typeorm';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import nodemailer from 'nodemailer';
import bcrypt from "bcrypt"

const generateToken = ():Promise<string|null>=>{
    return new Promise((resolve, reject) => {
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                reject(null);
                console.error("Failed to generate recovery token, error: ",err)
            } else {
                const token = buffer.toString('hex');
                resolve(token);
            }
        });
    })
}
const transporterOptions: SMTPTransport.Options = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: (process.env.EMAIL_SECURE == "TRUE" ? true : false),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
}
const transporter = nodemailer.createTransport(transporterOptions);

const getValidResetEmails = async(email:string)=>{
    const dayInMs = 24*60*60*1000;
    const validDates = (Date.now())-dayInMs;
    const resetEmailsRepository = (await AppDataSource).getRepository(ResetEmail);
    const validResetEmails = await resetEmailsRepository.find({where:{email:email,generatedAt:MoreThan(validDates)}})
    return validResetEmails;
}


export class passwordReset{
    async get(req: Request, res: Response): Promise<void> {
        res.render("password-reset")
    }
    async post(req: Request, res: Response): Promise<void> {
        res.json({success:true,message:"Sprawdź swoją skrzynkę mailową. Dostarczenie wiadomości może potrwać do kilku minut"});

        const {email}:{email:string} = req.body;
        console.log(`Password reset request for: ${email}`)
        if(!email || email === ""){
            return;
        }
        const userRepository = (await AppDataSource).getRepository(User);

        const user = userRepository.findBy({email:email});

        if(!user){
            return;
        }
        let failed = false;
        const token = await generateToken().catch(err=>{failed=true});
        
        if(!token || failed){
            return
        }
        const dayInMs = 24*60*60*1000;
        const validDates = (Date.now())-dayInMs;
        const resetEmailsRepository = (await AppDataSource).getRepository(ResetEmail);
        const validResetEmails = await resetEmailsRepository.find({where:{email:email,generatedAt:MoreThan(validDates)}})

        if(validResetEmails.length>=3){
            return;
        }

        const newResetEmail:ResetEmail = resetEmailsRepository.create({
            email:email,
            token:token
        });
        await resetEmailsRepository.save(newResetEmail);

        const url = `https://kaczormaszyny.pl/auth/password-reset/confirm/${token}`

        const plainTextMessage = `Resetowanie hasła

        W celu zresetowania hasła kliknij lub skopiuj poniższy link do przeglądarki:
        
            ${url}
        
        Jeśli nie prosiłeś o zresetowanie hasła, zignoruj tę wiadomość.
        Pozdrawiamy,
        Zespół Obsługi Klienta`

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
        `

        const emailObject = {
            from: `"Resetowanie hasła" <${process.env.EMAIL_USER_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: `Link do zresetowania hasła`, // Subject line
            text: (plainTextMessage), // plain text body
            html: (htmlMessage ), // html body
        };

        transporter.sendMail(emailObject);
    }
    async confirm(req: Request, res: Response): Promise<void> {
        const token = req.params.token;
        if(!token || token===""){
            return res.redirect("/auth/password-reset")
        }
        const dayInMs = 24*60*60*1000;
        const validDates = (Date.now())-dayInMs;
        const resetEmailsRepository = (await AppDataSource).getRepository(ResetEmail);
        const resetEmails = await resetEmailsRepository.find({where:{token:token,generatedAt:MoreThan(validDates),valid:true}});
        
        if(resetEmails.length!==1){
            return res.redirect("/auth/password-reset")
        }
        res.render("password-reset-confirm",{token:token})
    }
    async patch(req: Request, res: Response): Promise<void> {
        const token = req.body.token;
        const newPassword = req.body.password;
        if(!token || token==="" || !newPassword || newPassword===""){
            return res.redirect("/auth/password-reset")
        }
        const dayInMs = 24*60*60*1000;
        const validDates = (Date.now())-dayInMs;
        const resetEmailsRepository = (await AppDataSource).getRepository(ResetEmail);
        const resetEmail = await resetEmailsRepository.findOne({where:{token:token,generatedAt:MoreThan(validDates),valid:true}});
        
        if(!resetEmail){
            return res.redirect("/auth/password-reset")
        }

        const userRepository = (await AppDataSource).getRepository(User);
        const updatedUser = await userRepository.findOne({where:{email:resetEmail.email}});
        if(!updatedUser){
            return res.redirect("/auth/password-reset")
        }
        updatedUser.password = await bcrypt.hash(newPassword,(Number(process.env.PASSWORD_HASH_ROUND) || 10))
        await userRepository.save(updatedUser);
        

        resetEmail.valid=false;
        await resetEmailsRepository.save(resetEmail);
        
        res.json({success:true,message:"Pomyślnie zresetowano hasło"});
    }

}

