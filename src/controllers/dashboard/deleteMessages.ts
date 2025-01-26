
import { Request, Response } from 'express';
import { deleteSelectedMessagesFromDatabase } from '../../utils';
import { AppDataSource } from '../../data-source';
import { Message } from '../../entity/Message';
import { TransportMessage } from '../../entity/TransportMessages';

export const deleteMessagesController = async (req: Request, res: Response) => {
    const selectedMessageIds = req.body.messages;
    const messageRepository = (await AppDataSource).getRepository(Message);

    if (!selectedMessageIds || selectedMessageIds.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do usunięcia.' });
    }
    try {
        await deleteSelectedMessagesFromDatabase(selectedMessageIds,messageRepository);
        res.json({ success: true });
    } catch (error) {
        console.error('Błąd podczas usuwania wiadomości:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas usuwania wiadomości.' });
    }
}
export const deleteTransportMessagesController = async (req: Request, res: Response) => {
    const selectedMessageIds = req.body.messages;
    const messageRepository = (await AppDataSource).getRepository(TransportMessage);

    if (!selectedMessageIds || selectedMessageIds.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do usunięcia.' });
    }
    try {
        await deleteSelectedMessagesFromDatabase(selectedMessageIds,messageRepository);
        res.json({ success: true });
    } catch (error) {
        console.error('Błąd podczas usuwania wiadomości:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas usuwania wiadomości.' });
    }
}