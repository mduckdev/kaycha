
import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Message } from '../../entity/Message';

export const deleteMessageController = async (req: Request, res: Response) => {
    const messageId = req.body.messageId;

    const messageRepository = (await AppDataSource).getRepository(Message);

    const messageToRemove = await messageRepository.findOneByOrFail({ id: Number(messageId) }).catch(error => {
        console.error(error);
        res.status(401).send("No such message").end();
        return;
    });
    if (messageToRemove) {
        await messageRepository.remove(messageToRemove);
        return res.json({ success: true });
    }


}