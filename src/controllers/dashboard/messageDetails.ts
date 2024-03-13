
import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Message } from '../../entity/Message';

export const messageDetailsController = async (req: Request, res: Response) => {
    const messageId = req.params.id;

    const messageRepository = (await AppDataSource).getRepository(Message);
    try {
        const messageDetails = await messageRepository.findOneByOrFail({ id: Number(messageId) });
        res.render('message-details', { message: messageDetails  });
    } catch (err: any) {
        console.error('Błąd podczas pobierania szczegółów wiadomości:', err.message);
        if (err.name === 'EntityNotFound') {
            return res.status(404).send('Wiadomość o podanym ID nie została znaleziona.');
        } else {
            return res.status(500).send('Wystąpił błąd podczas pobierania szczegółów wiadomości.');
        }
    }
}