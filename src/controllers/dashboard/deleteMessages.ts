
import { Request, Response } from 'express';
import { deleteSelectedMessagesFromDatabase } from '../../utils';

export const deleteMessagesController = async (req: Request, res: Response) => {
    const selectedMessageIds = req.body.messages;

    if (!selectedMessageIds || selectedMessageIds.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do usunięcia.' });
    }
    try {
        await deleteSelectedMessagesFromDatabase(selectedMessageIds);
        res.json({ success: true });
    } catch (error) {
        console.error('Błąd podczas usuwania wiadomości:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas usuwania wiadomości.' });
    }
}