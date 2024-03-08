
import { Request, Response } from 'express';
import { getSelectedMessagesFromDatabase } from '../../utils';
import { createObjectCsvWriter } from 'csv-writer';

export const exportMessagesCsvController = async (req: Request, res: Response) => {
    const selectedMessageIds = req.body.messages;
    if (!selectedMessageIds || selectedMessageIds.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
    }
    const selectedMessages = await getSelectedMessagesFromDatabase(selectedMessageIds).catch(err => { console.error(err); return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania wiadomości z bazy danych.' }); });

    if (!selectedMessages || selectedMessages.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
    }

    // Definiuj nagłówki pliku CSV
    const csvHeaders = [
        { id: 'timestamp', title: 'Data' },
        { id: 'firstName', title: 'Imię' },
        { id: 'lastName', title: 'Nazwisko' },
        { id: 'phoneNumber', title: 'Numer telefonu' },
        { id: 'email', title: 'Email' },
        { id: 'city', title: 'Miejscowość' },
        { id: 'street', title: 'Ulica' },
        { id: 'homeNumber', title: 'Numer domu/mieszkania' },
        { id: 'message', title: 'Treść wiadomości' },
    ];

    // Utwórz obiekt csvWriter z nagłówkami
    const csvWriter = createObjectCsvWriter({
        path: 'exported_messages.csv',
        header: csvHeaders,
    });

    // Zapisz wiadomości do pliku CSV
    csvWriter.writeRecords(selectedMessages)
        .then(() => {
            console.log(`Plik CSV został pomyślnie wyeksportowany przez użytkownika: ${req.session.user?.username}`);
            // Odpowiedź klientowi z linkiem do pobrania pliku
            res.download('exported_messages.csv', 'exported_messages.csv', (err) => {
                if (err) {
                    console.error('Błąd podczas wysyłania pliku:', err);
                    res.status(500).json({ error: 'Wystąpił błąd podczas wysyłania pliku.' });
                }
            });
        })
        .catch(error => {
            console.error('Błąd podczas zapisywania do pliku CSV:', error);
            res.status(500).json({ error: 'Wystąpił błąd podczas eksportowania.' });
        });
}