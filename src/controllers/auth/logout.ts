import { Request, Response } from 'express';

export const logoutController = (req: Request, res: Response): void => {
    req.session.destroy((err) => {
        if (err) console.error(err)
        res.redirect("/");
    })
}