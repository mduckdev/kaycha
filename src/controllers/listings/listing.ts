import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import { Listing } from '../../entity/Listing';

export class listing {
    async get(req: Request, res: Response): Promise<void> {
        const listingRepository = (await AppDataSource).getRepository(Listing);
        const listings = await listingRepository.find();
        res.render('listings/all', { listings, user: req.session.user, csrfToken: req.session.csrfToken });
    }
    async post(req: Request, res: Response): Promise<void> {

    }
    async delete(req: Request, res: Response): Promise<void> {

    }
}