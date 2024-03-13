
import { Request, Response } from 'express';

export const profileController = (req: Request, res: Response) => {
    res.render("profile", { user: req.session.user,csrfToken:req.session.csrfToken });
}