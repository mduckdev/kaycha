
import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import bcrypt from 'bcrypt';
import { Session } from '../../entity/Session';

export const changeProfileController = async (req: Request, res: Response) => {
    const { newUsername = "", currentPassword = "", newPassword = "", newEmail = "" } = req.body;
    if (newUsername === "") {
        return res.status(401).send("Brakuje niezbędnych pól.");
    }
    const emailExpresion = new RegExp(/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/);
    if (!newEmail.match(emailExpresion) && newEmail != "") {
        return res.status(401).send("Nieprawidłowy email.");
    }

    const userRepository = (await AppDataSource).getRepository(User);
    const currentUser = await userRepository.findOneBy({ id: req.session.user?.id });

    if (!currentUser) {
        return res.status(500).send('Nie można znaleźć użytkownika.');
    }

    if (currentPassword !== "" && newPassword !== "") {
        if (!bcrypt.compareSync(currentPassword, currentUser.password)) {
            return res.status(401).send("Nieprawidłowe hasło.");
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        currentUser.username = newUsername;
        currentUser.password = hashedPassword;
        currentUser.email = newEmail;
        try{
            const sessionRepository = (await AppDataSource).getRepository(Session);
            const sessions = await sessionRepository.createQueryBuilder("sessions")
            .where("sessions.id != :id",{id:req.sessionID})
            .andWhere("sessions.json LIKE :userString",{userString:`%"username":"${req.session.user?.username}"%`})
            .andWhere("sessions.destroyedAt IS NULL")
            .update()
            .set({destroyedAt:new Date()})
            .execute()
            console.log(sessions)
        }catch(error){
            res.json({error:"Failed to logout from all devices after password change"})
        }
    } else {
        currentUser.username = newUsername;
        currentUser.email = newEmail;
    }

    try {
        await userRepository.save(currentUser);
    } catch (updateErr) {
        console.error(updateErr);
        return res.status(500).send('Internal Server Error');
    }

    const updatedUser = await userRepository.findOneBy({ id: req.session.user?.id });

    if (!updatedUser) {
        return res.status(500).send('Nie można znaleźć zaktualizowanego użytkownika.');
    }

    req.session.user = updatedUser;
    res.redirect('/dashboard');
}