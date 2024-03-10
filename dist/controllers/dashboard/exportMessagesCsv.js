"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportMessagesCsvController = void 0;
const utils_1 = require("../../utils");
const csv_writer_1 = require("csv-writer");
const exportMessagesCsvController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const selectedMessageIds = req.body.messages;
    if (!selectedMessageIds || selectedMessageIds.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
    }
    const selectedMessages = yield (0, utils_1.getSelectedMessagesFromDatabase)(selectedMessageIds).catch(err => { console.error(err); return res.status(500).json({ error: 'Wystąpił błąd podczas pobierania wiadomości z bazy danych.' }); });
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
    const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
        path: 'exported_messages.csv',
        header: csvHeaders,
    });
    // Zapisz wiadomości do pliku CSV
    csvWriter.writeRecords(selectedMessages)
        .then(() => {
        var _a;
        console.log(`Plik CSV został pomyślnie wyeksportowany przez użytkownika: ${(_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username}`);
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
});
exports.exportMessagesCsvController = exportMessagesCsvController;
