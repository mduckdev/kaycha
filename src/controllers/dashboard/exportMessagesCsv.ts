
import { Request, Response } from 'express';
import { getSelectedMessagesFromDatabase } from '../../utils';
import { promises as fs } from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import { AppDataSource } from '../../data-source';
import { TransportMessage } from '../../entity/TransportMessages';
import { Message } from '../../entity/Message';
import archiver from 'archiver';

export const exportMessagesCsvController = async (req: Request, res: Response) => {
    const selectedMessagesObj = req.body.messages;
    if (!selectedMessagesObj || selectedMessagesObj.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
    }
    const transportMessagesIds:number[] = selectedMessagesObj.filter((e: { id:number,src: string; })=>e.src==="kaczortransport.pl").map((e: {  id:number,src: string;  })=>e.id);
    const machinesMessagesIds:number[] = selectedMessagesObj.filter((e: { id:number,src: string; })=>e.src==="kaczormaszyny.pl").map((e: {  id:number,src: string;  })=>e.id);

    const selectedTransportMessages = await getSelectedMessagesFromDatabase(transportMessagesIds,(await AppDataSource).getRepository(TransportMessage)).catch(err => { console.error(err); res.status(500).json({ error: 'Wystąpił błąd podczas pobierania wiadomości z bazy danych.' }); return null});
    const selectedMachinesMessages = await getSelectedMessagesFromDatabase(machinesMessagesIds,(await AppDataSource).getRepository(Message)).catch(err => { console.error(err); res.status(500).json({ error: 'Wystąpił błąd podczas pobierania wiadomości z bazy danych.' }); return null});

    if ((!selectedTransportMessages && !selectedMachinesMessages) || (selectedTransportMessages.length === 0 && selectedMachinesMessages.length===0)) {
        return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
    }

    const newFilesList:string[]=[];
    if (machinesMessagesIds.length > 0) {
        const csvPath = 'exported_messages.csv';
        let csvWriter = createObjectCsvWriter({
            path: csvPath,
            header: [
                { id: 'timestamp', title: 'Data' },
                { id: 'firstName', title: 'Imię' },
                { id: 'lastName', title: 'Nazwisko' },
                { id: 'phoneNumber', title: 'Numer telefonu' },
                { id: 'email', title: 'Email' },
                { id: 'city', title: 'Miejscowość' },
                { id: 'street', title: 'Ulica' },
                { id: 'homeNumber', title: 'Numer domu/mieszkania' },
                { id: 'message', title: 'Treść wiadomości' },
            ],
        });
    
        await csvWriter.writeRecords(selectedMachinesMessages)
            .then(() => {
                console.log(`Plik CSV został pomyślnie wyeksportowany.`);
                newFilesList.push(csvPath); // Dodaj plik do listy
            })
            .catch(error => {
                console.error('Błąd podczas zapisywania do pliku CSV:', error);
                return res.status(500).json({ error: 'Wystąpił błąd podczas eksportowania.' });
            });
    }
    
    if (transportMessagesIds.length > 0) {
        const csvPath = 'exported_transport_messages.csv';
        let csvWriter = createObjectCsvWriter({
            path: csvPath,
            header: [
                { id: 'timestamp', title: 'Data' },
                { id: 'firstName', title: 'Imię' },
                { id: 'lastName', title: 'Nazwisko' },
                { id: 'phoneNumber', title: 'Numer telefonu' },
                { id: 'email', title: 'Email' },
                { id: 'loadingAddress', title: 'Adres załadunku' },
                { id: 'unloadingAddress', title: 'Adres rozładunku' },
                { id: 'message', title: 'Treść wiadomości' },
            ],
        });
    
        await csvWriter.writeRecords(selectedTransportMessages)
            .then(() => {
                console.log(`Plik CSV został pomyślnie wyeksportowany.`);
                newFilesList.push(csvPath); // Dodaj plik do listy
            })
            .catch(error => {
                console.error('Błąd podczas zapisywania do pliku CSV:', error);
                return res.status(500).json({ error: 'Wystąpił błąd podczas eksportowania.' });
            });
    }
    
    if (newFilesList.length === 0) {
        return res.status(400).json({ error: 'Nie utworzono żadnych plików do archiwum.' });
    }
    
    // Tworzenie archiwum ZIP
    const archive = archiver('zip');
    archive.pipe(res);
    res.attachment('exported_messages.zip');
    
    newFilesList.forEach((filename) => {
        archive.file(filename, { name: filename });
    });
    
    // Zakończ archiwum
    archive.finalize();
    
    // Usuń pliki po zakończeniu
    archive.on('finish', () => {
        newFilesList.forEach(async (filename) => {
            try {
                await fs.rm(filename);
            } catch (err) {
                console.error(`Błąd podczas usuwania pliku: ${filename}`, err);
            }
        });
    });
    
}