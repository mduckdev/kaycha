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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportMessagesCsvController = void 0;
const utils_1 = require("../../utils");
const fs_1 = require("fs");
const csv_writer_1 = require("csv-writer");
const data_source_1 = require("../../data-source");
const TransportMessages_1 = require("../../entity/TransportMessages");
const Message_1 = require("../../entity/Message");
const archiver_1 = __importDefault(require("archiver"));
const exportMessagesCsvController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const selectedMessagesObj = req.body.messages;
    if (!selectedMessagesObj || selectedMessagesObj.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
    }
    const transportMessagesIds = selectedMessagesObj.filter((e) => e.src === "kaczortransport.pl").map((e) => e.id);
    const machinesMessagesIds = selectedMessagesObj.filter((e) => e.src === "kaczormaszyny.pl").map((e) => e.id);
    const selectedTransportMessages = yield (0, utils_1.getSelectedMessagesFromDatabase)(transportMessagesIds, (yield data_source_1.AppDataSource).getRepository(TransportMessages_1.TransportMessage)).catch(err => { console.error(err); res.status(500).json({ error: 'Wystąpił błąd podczas pobierania wiadomości z bazy danych.' }); return null; });
    const selectedMachinesMessages = yield (0, utils_1.getSelectedMessagesFromDatabase)(machinesMessagesIds, (yield data_source_1.AppDataSource).getRepository(Message_1.Message)).catch(err => { console.error(err); res.status(500).json({ error: 'Wystąpił błąd podczas pobierania wiadomości z bazy danych.' }); return null; });
    if ((!selectedTransportMessages && !selectedMachinesMessages) || (selectedTransportMessages.length === 0 && selectedMachinesMessages.length === 0)) {
        return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
    }
    const newFilesList = [];
    if (machinesMessagesIds.length > 0) {
        const csvPath = 'exported_messages.csv';
        let csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
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
        yield csvWriter.writeRecords(selectedMachinesMessages)
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
        let csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
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
        yield csvWriter.writeRecords(selectedTransportMessages)
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
    const archive = (0, archiver_1.default)('zip');
    archive.pipe(res);
    res.attachment('exported_messages.zip');
    newFilesList.forEach((filename) => {
        archive.file(filename, { name: filename });
    });
    // Zakończ archiwum
    archive.finalize();
    // Usuń pliki po zakończeniu
    archive.on('finish', () => {
        newFilesList.forEach((filename) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield fs_1.promises.rm(filename);
            }
            catch (err) {
                console.error(`Błąd podczas usuwania pliku: ${filename}`, err);
            }
        }));
    });
});
exports.exportMessagesCsvController = exportMessagesCsvController;
