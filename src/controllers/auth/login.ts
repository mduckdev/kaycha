
import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import bcrypt from "bcrypt";

export const loginController = (req: Request, res: Response): void => {
    res.render("login");
}
export const loginPostController = async (req: Request, res: Response): Promise<void> => {
    const { username = "", password = "" }: { username: string, password: string } = req.body;

    try {
        // Get repository for User entity

        const userRepository = (await AppDataSource).getRepository(User);

        // Retrieve user from the database by username
        const user = await userRepository.findOneBy({ "username": username });
        // Check if the user exists and the password is correct
        if (user && bcrypt.compareSync(password, user.password)) {
            console.log(`Successfull login for user ${user.username} from ${req?.header('x-forwarded-for')?.split(",")[0] || req.socket.remoteAddress}:${req.socket.remotePort}`)
            req.session.user = user;
            return res.redirect('/dashboard');
        } else {
            return res.redirect('/auth/login');
        }
    } catch (error) {
        console.error('Error occurred during login:', error);
        res.status(500).send('Internal Server Error').end();
    }
}