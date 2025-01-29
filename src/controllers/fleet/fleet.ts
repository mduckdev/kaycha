import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { validate } from 'class-validator';
import { FleetVehicle } from '../../entity/Fleet';

export class Fleet {
    async getIndex(req: Request, res: Response): Promise<void> {
        const fleetRepository = (await AppDataSource).getRepository(FleetVehicle);
        const fleet = await fleetRepository.find();
        res.render('fleet/index', { vehicles:fleet, user: req.session.user, csrfToken: req.session.csrfToken });
    }
    async getAdd(req: Request, res: Response): Promise<void> {
        res.render('fleet/add', { user: req.session.user, csrfToken: req.session.csrfToken });
    }
    async getEdit(req: Request, res: Response): Promise<void> {
        const fleetRepository = (await AppDataSource).getRepository(FleetVehicle);
        const id = Number(req.params.id);
        const vehicle:FleetVehicle|null = await fleetRepository.findOneBy({ id: id });
        if(vehicle){
            res.render('fleet/edit', { vehicle, user: req.session.user, csrfToken: req.session.csrfToken });
        }else{
            res.status(400).send("Nieprawidłowe ID");
        }
    }
   

    async put(req: Request, res: Response): Promise<void> {
        const fleetRepository = (await AppDataSource).getRepository(FleetVehicle);
        const newVehicle = new FleetVehicle();
        newVehicle.model = String(req.body.model);
        newVehicle.loadCapacity = Number(req.body.loadCapacity);
        newVehicle.gvm = Number(req.body.gvm);
        newVehicle.platformLength = Number(req.body.platformLength);
        newVehicle.flatPartLength = Number(req.body.flatPartLength);
        newVehicle.slopeLength = Number(req.body.slopeLength);
        newVehicle.platformWidth = Number(req.body.platformWidth);
        newVehicle.platformHeight = Number(req.body.platformHeight);
        newVehicle.loadingSlopeHeight = Number(req.body.loadingSlopeHeight);
        newVehicle.rampLength = Number(req.body.rampLength);
        newVehicle.maxLoadHeight = Number(req.body.maxLoadHeight);
        newVehicle.passengerSeats = Number(req.body.passengerSeats);
        newVehicle.imgSrc = String(req.body.imgSrc);
        newVehicle.additionalInfo = String(req.body.additionalInfo);


        const errors = await validate(newVehicle);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }

        await fleetRepository.save(newVehicle);
        res.json({ success: true, message: "Dodano nowe ogłoszenie" });
    }
    async patch(req: Request, res: Response): Promise<void> {
        const fleetRepository = (await AppDataSource).getRepository(FleetVehicle);
        let vehicleToUpdate = await fleetRepository.findOneBy({ id: Number(req.params.id) });
        if (vehicleToUpdate) {
            vehicleToUpdate.model = String(req.body.model);
            vehicleToUpdate.loadCapacity = Number(req.body.loadCapacity);
            vehicleToUpdate.gvm = Number(req.body.gvm);
            vehicleToUpdate.platformLength = Number(req.body.platformLength);
            vehicleToUpdate.flatPartLength = Number(req.body.flatPartLength);
            vehicleToUpdate.slopeLength = Number(req.body.slopeLength);
            vehicleToUpdate.platformWidth = Number(req.body.platformWidth);
            vehicleToUpdate.platformHeight = Number(req.body.platformHeight);
            vehicleToUpdate.loadingSlopeHeight = Number(req.body.loadingSlopeHeight);
            vehicleToUpdate.rampLength = Number(req.body.rampLength);
            vehicleToUpdate.maxLoadHeight = Number(req.body.maxLoadHeight);
            vehicleToUpdate.passengerSeats = Number(req.body.passengerSeats);
            vehicleToUpdate.imgSrc = String(req.body.imgSrc);
            vehicleToUpdate.additionalInfo = String(req.body.additionalInfo);


            const errors = await validate(vehicleToUpdate);
            if (errors.length > 0) {
                res.status(400).json({ errors });
                return;
            }

            await fleetRepository.save(vehicleToUpdate);
            res.json({ success: true, message: "Pomyślnie zaktualizowano pojazd" });
        }else{
            res.json({ success: false, message: "Nie znaleziono pojazdu z podanym id" });

        }
    }
    async delete(req: Request, res: Response): Promise<void> {
        const fleetRepository = (await AppDataSource).getRepository(FleetVehicle);
        const result = await fleetRepository.delete(Number(req.params.id));
        if (result.affected === 1) {
            res.status(200).json({ success: true, message: 'Pomyślnie usunięto pojazd.' });
        } else {
            res.status(404).json({ success: false, message: 'Nie znaleziono pojazdu o podanym ID do usunięcia.' });
        }
    }
}