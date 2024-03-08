
import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import bcrypt from 'bcrypt';

export const changeProfileController = async (req: Request, res: Response) => {
    const { newUsername, currentPassword, newPassword, newEmail } = req.body;
    const emailExpresion = new RegExp(/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/);
    if (!newEmail.match(emailExpresion) && newEmail != "") {
        return res.status(401).send("Nieprawidłowy email.");
    }

    const userRepository = AppDataSource.getRepository(User);
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