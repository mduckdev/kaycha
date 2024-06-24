import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import { Listing } from '../../entity/Listing';
import { validate } from 'class-validator';

export class listing {
    async getIndex(req: Request, res: Response): Promise<void> {
        const listingRepository = (await AppDataSource).getRepository(Listing);
        const listings = await listingRepository.find();
        res.render('listings/index', { listings, user: req.session.user, csrfToken: req.session.csrfToken });
    }
    async getAdd(req: Request, res: Response): Promise<void> {
        res.render('listings/add', { user: req.session.user, csrfToken: req.session.csrfToken });
    }
    async getEdit(req: Request, res: Response): Promise<void> {
        const listingRepository = (await AppDataSource).getRepository(Listing);
        const id = Number(req.params.id);
        const listing = await listingRepository.findOneBy({ id: id });
        res.render('listings/edit', { listing, user: req.session.user, csrfToken: req.session.csrfToken });
    }
    async put(req: Request, res: Response): Promise<void> {
        const listingRepository = (await AppDataSource).getRepository(Listing);
        const newListing = new Listing();
        newListing.title = req.body.title;
        newListing.imgSrc = req.body.imgSrc;
        newListing.href = req.body.href;
        newListing.year = Number(req.body.year);
        newListing.price = Number(req.body.price);

        const errors = await validate(newListing);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }

        await listingRepository.save(newListing);
        res.json({ success: true, message: "Dodano nowe ogłoszenie" });
    }
    async patch(req: Request, res: Response): Promise<void> {
        const listingRepository = (await AppDataSource).getRepository(Listing);
        let listingToUpdate = await listingRepository.findOneBy({ id: Number(req.params.id) });
        if (listingToUpdate) {
            listingToUpdate.title = req.body.title;
            listingToUpdate.imgSrc = req.body.imgSrc;
            listingToUpdate.href = req.body.href;
            listingToUpdate.year = Number(req.body.year);
            listingToUpdate.price = Number(req.body.price);

            const errors = await validate(listingToUpdate);
            if (errors.length > 0) {
                res.status(400).json({ errors });
                return;
            }

            await listingRepository.save(listingToUpdate);
        }
        res.json({ success: true, message: "Pomyślnie zaktualizowano ogłoszenie" });
    }
    async delete(req: Request, res: Response): Promise<void> {
        const listingRepository = (await AppDataSource).getRepository(Listing);
        const result = await listingRepository.delete(Number(req.params.id));
        if (result.affected === 1) {
            res.status(200).json({ success: true, message: 'Pomyślnie usunięto ogłoszenie.' });
        } else {
            res.status(404).json({ success: false, message: 'Nie znaleziono ogłoszenia o podanym ID do usunięcia.' });
        }


    }
}