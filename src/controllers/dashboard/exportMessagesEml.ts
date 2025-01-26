
import { Request, Response } from 'express';
import { getSelectedMessagesFromDatabase } from '../../utils';
import path from 'path';
import { promises as fs } from 'fs';
import archiver from 'archiver';
import { MessageI, TransportMessageI } from '../../interfaces/models';
import { TransportMessage } from '../../entity/TransportMessages';
import { Message } from '../../entity/Message';
import { AppDataSource } from '../../data-source';

export const exportMessagesEmlController = async (req: Request, res: Response) => {
    const selectedMessagesObj = req.body.messages;
    if (!selectedMessagesObj || selectedMessagesObj.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
    }
    const transportMessagesIds:number[] = selectedMessagesObj.filter((e: { id:number,src: string; })=>e.src==="kaczortransport.pl").map((e: {  id:number,src: string;  })=>e.id);
    const machinesMessagesIds:number[] = selectedMessagesObj.filter((e: { id:number,src: string; })=>e.src==="kaczormaszyny.pl").map((e: {  id:number,src: string;  })=>e.id);

    const selectedTransportMessages = await getSelectedMessagesFromDatabase(transportMessagesIds,(await AppDataSource).getRepository(TransportMessage)).catch(err => { console.error(err); return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania wiadomości z bazy danych.' }); });
    const selectedMachinesMessages = await getSelectedMessagesFromDatabase(machinesMessagesIds,(await AppDataSource).getRepository(Message)).catch(err => { console.error(err); return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania wiadomości z bazy danych.' }); });
    const tempDir = path.join(__dirname, 'temp_eml');

    if (selectedTransportMessages.length === 0 && selectedMachinesMessages.length === 0) {
        return res.status(404).json({ error: 'Brak wiadomości o podanych ID.' });
    }
    let emlMachinesPromises=[];
    let emlTransportPromises=[];
    try {
        // Utwórz katalog tymczasowy do zapisywania plików .eml
        await fs.mkdir(tempDir, { recursive: true });

        if(selectedMachinesMessages){
         emlMachinesPromises = selectedMachinesMessages.map(async (message: MessageI) => {
            const emlContent = `Delivered-To: ${message.email}
        Return-Path: <${message.email}>
        From: =?UTF-8?Q?${message.firstName} ${message.lastName}?= <${message.email}>
        To: <test@test.com>
        Subject: Wiadomość od ${message.firstName} ${message.lastName} 
        Date: ${new Date(message.timestamp).toUTCString()}
        Content-Type: text/html; charset=utf-8; format=flowed
        Content-Transfer-Encoding: 7bit
        Content-Language: pl-PL
        Reply-To: ${message.firstName} ${message.lastName} <${message.email}>

        <!DOCTYPE html>
        <html lang="pl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                }

                h2 {
                    color: #007bff;
                }

                ul {
                    list-style-type: none;
                    padding: 0;
                }

                li {
                    margin-bottom: 10px;
                }

                p {
                    margin-top: 0;
                }
            </style>
        </head>
        <body>
            <h2>Dane klienta:</h2>
            <ul>
                <li>🗄️ Dane klienta: ${message.firstName} ${message.lastName}</li>
                <li>☎️ Nr telefonu: ${message.phoneNumber}</li>
                <li>🏡 Adres: ${message.city}, ${message.street} ${message.homeNumber}</li>
            </ul>
            <h2>ℹ️ Treść wiadomości:</h2>
            <p>${message.message}</p>
        </body>
        </html>`;

            const fileName = `${tempDir}/message_${Number(message.id)}.eml`;
            await fs.writeFile(fileName, emlContent);
            return fileName;
            });
        }

      
        if(selectedTransportMessages){
             emlTransportPromises = selectedTransportMessages.map(async (message: TransportMessageI) => {
                const emlContent = `Delivered-To: ${message.email}
                Return-Path: <${message.email}>
                From: =?UTF-8?Q?${message.firstName} ${message.lastName}?= <${message.email}>
                To: <test@test.com>
                Subject: Wiadomość od ${message.firstName} ${message.lastName} 
                Date: ${new Date(message.timestamp).toUTCString()}
                Content-Type: text/html; charset=utf-8; format=flowed
                Content-Transfer-Encoding: 7bit
                Content-Language: pl-PL
                Reply-To: ${message.firstName} ${message.lastName} <${message.email}>
                
                <!DOCTYPE html>
                        <html lang="pl">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f4f4f4;
                                    color: #333;
                                    margin: 0;
                                    padding: 20px;
                                }
                        
                                h2 {
                                    color: #007bff;
                                }
                        
                                ul {
                                    list-style-type: none;
                                    padding: 0;
                                }
                        
                                li {
                                    margin-bottom: 10px;
                                }
                        
                                p {
                                    margin-top: 0;
                                }
                            </style>
                        </head>
                        <body>
                            <h2>Dane klienta:</h2>
                            <ul>
                                <li>🗄️ Dane klienta: ${message.firstName} ${message.lastName}</li>
                                <li>☎️ Nr telefonu: ${message.phoneNumber}</li>
                                <li>📦 Adres załadunku: ${message.loadingAddress}</li>
                                <li>🚚 Adres rozładunku: ${message.unloadingAddress}</li>
                            </ul>
                            <h2>ℹ️ Treść wiadomości:</h2>
                            <p>${message.message}</p>
                        </body>
                        </html>`;
    
                const fileName = `${tempDir}/message_${Number(message.id)}.eml`;
                await fs.writeFile(fileName, emlContent);
                return fileName;
            })
        }
        
        // Czekaj na zakończenie wszystkich obietnic .eml
        const emlMachineFiles = await Promise.all(emlMachinesPromises);
        const emlTransportFiles = await Promise.all(emlTransportPromises);

        const emlFiles= [...emlMachineFiles,...emlTransportFiles];

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