
import { Request, Response } from 'express';
import { getSelectedMessagesFromDatabase } from '../../utils';
import path from 'path';
import { promises as fs } from 'fs';
import archiver from 'archiver';
import { MessageI } from '../../interfaces/models';

export const exportMessagesEmlController = async (req: Request, res: Response) => {
    const selectedMessageIds = req.body.messages;

    if (!selectedMessageIds || selectedMessageIds.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
    }
    const tempDir = path.join(__dirname, 'temp_eml');

    try {
        // Użyj funkcji getSelectedMessagesFromDatabase z użyciem async/await
        const selectedMessages = await getSelectedMessagesFromDatabase(selectedMessageIds);

        if (selectedMessages.length === 0) {
            return res.status(404).json({ error: 'Brak wiadomości o podanych ID.' });
        }



        // Utwórz katalog tymczasowy do zapisywania plików .eml
        await fs.mkdir(tempDir, { recursive: true });

        // Twórz pliki .eml dla każdej wiadomości
        const emlPromises = selectedMessages.map(async (message: MessageI) => {
            const emlContent = `Delivered-To: ${message.email}
Return-Path: <${message.email}>
From: =?UTF-8?Q?${message.firstName} ${message.lastName}?= <${message.email}>
To: <test@test.com>
Subject: Wiadomość od ${message.firstName} ${message.lastName} 
Date: ${new Date(message.timestamp).toUTCString()}
Content-Type: text/plain; charset=utf-8; format=flowed
Content-Transfer-Encoding: 7bit
Content-Language: pl-PL
Reply-To: ${message.firstName} ${message.lastName} <${message.email}>

Dane klienta: 
Imię: ${message.firstName} Nazwisko: ${message.lastName}
Nr telefonu: ${message.phoneNumber}
Adres: ${message.city}, ${message.street} ${message.homeNumber}
Treść wiadomości:
${message.message}`;

            const fileName = `${tempDir}/message_${message.id}.eml`;
            await fs.writeFile(fileName, emlContent);
            return fileName;
        });

        // Czekaj na zakończenie wszystkich obietnic .eml
        const emlFiles = await Promise.all(emlPromises);

        // Twórz plik ZIP i dodaj pliki .eml
        const archive = archiver('zip');
        emlFiles.forEach((emlFile) => {
            const fileName = emlFile.split('/').pop();
            archive.file(emlFile, { name: fileName });
        });

        // Zakończ i utwórz plik ZIP
        archive.finalize();

        // Wysyłaj plik ZIP do przeglądarki
        res.attachment('exported_messages.zip');

        archive.pipe(res)

        archive.on("finish", () => {
            fs.rm(tempDir, { recursive: true, force: true });
        })

    } catch (error) {
        console.error('Błąd podczas eksportowania plików .eml:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas eksportowania plików .eml.' });
    }
}