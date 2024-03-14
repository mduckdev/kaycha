
import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Session } from '../../entity/Session';

export const logoutDevicesController = async (req: Request, res: Response) => {
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
        res.json({success:true})
    }catch(error){
        res.json({error:"Failed to logout from all devices"})
    }
}