import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { FleetVehicle } from "../../entity/Fleet";
import { FleetResponseI } from "../../interfaces/responses";

export const getFleetController = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
    const fleetRepository = (await AppDataSource).getRepository(FleetVehicle);
    const fleet:FleetVehicle[] = await fleetRepository.find();
    const obj:FleetResponseI[] = fleet.map(e=>e.toResponseObject());
    return res.status(200).json(obj);
}