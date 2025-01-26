import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Message } from '../../entity/Message';
import { TransportMessage } from '../../entity/TransportMessages';

export const dashboardController = async (req: Request, res: Response) => {
    const sortColumns: { [key: string]: string } = {
        "firstName": "firstName",
        "lastName": "lastName",
        "phoneNumber": "phoneNumber",
        "email": "email",
        "message": "message",
    }
    const searchQuery = (!req.query.search) ? "%%" : ("%" + req.query.search + "%");
    const sortBy = sortColumns[String(req.query.sortBy)] || 'id';
    const sortDirection = String(req.query.sortDirection) || 'desc';// Domyślnie malejąco
    try {
        const messageRepository = (await AppDataSource).getRepository(Message);
        const messages = await messageRepository.createQueryBuilder('message')
            .where('message.firstName LIKE :searchQuery OR message.lastName LIKE :searchQuery OR message.phoneNumber LIKE :searchQuery OR message.email LIKE :searchQuery OR message.city LIKE :searchQuery OR message.street LIKE :searchQuery OR message.homeNumber LIKE :searchQuery OR message.message LIKE :searchQuery', { searchQuery })
            .orderBy(`message.${sortBy}`, sortDirection == "asc" ? "ASC" : "DESC")
            .getMany();
        const transportMessageRepository = (await AppDataSource).getRepository(TransportMessage);
        const transportMessages=await transportMessageRepository.createQueryBuilder('message')
        .where('message.firstName LIKE :searchQuery OR message.lastName LIKE :searchQuery OR message.phoneNumber LIKE :searchQuery OR message.email LIKE :searchQuery OR message.unloadingAddress LIKE :searchQuery OR message.loadingAddress LIKE :searchQuery OR message.message LIKE :searchQuery', { searchQuery })
        .orderBy(`message.${sortBy}`, sortDirection == "asc" ? "ASC" : "DESC")
        .getMany();

        res.render('dashboard', { messages:[...messages,...transportMessages], user: req.session.user,csrfToken:req.session.csrfToken  });
    } catch (error) {
        console.error('Error occurred while fetching messages from the database:', error);
        res.status(500).send('Internal Server Error');
    }
}