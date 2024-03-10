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
exports.exportMessagesEmlController = void 0;
const utils_1 = require("../../utils");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const archiver_1 = __importDefault(require("archiver"));
const exportMessagesEmlController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const selectedMessageIds = req.body.messages;
    if (!selectedMessageIds || selectedMessageIds.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do eksportu.' });
    }
    const tempDir = path_1.default.join(__dirname, 'temp_eml');
    try {
        // Użyj funkcji getSelectedMessagesFromDatabase z użyciem async/await
        const selectedMessages = yield (0, utils_1.getSelectedMessagesFromDatabase)(selectedMessageIds);
        if (selectedMessages.length === 0) {
            return res.status(404).json({ error: 'Brak wiadomości o podanych ID.' });
        }
        // Utwórz katalog tymczasowy do zapisywania plików .eml
        yield fs_1.promises.mkdir(tempDir, { recursive: true });
        // Twórz pliki .eml dla każdej wiadomości
        const emlPromises = selectedMessages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
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
            const fileName = `${tempDir}/message_${message.id}.eml`;
            yield fs_1.promises.writeFile(fileName, emlContent);
            return fileName;
        }));
        // Czekaj na zakończenie wszystkich obietnic .eml
        const emlFiles = yield Promise.all(emlPromises);
        // Twórz plik ZIP i dodaj pliki .eml
        const archive = (0, archiver_1.default)('zip');
        emlFiles.forEach((emlFile) => {
            const fileName = emlFile.split('/').pop();
            archive.file(emlFile, { name: fileName });
        });
        // Zakończ i utwórz plik ZIP
        archive.finalize();
        // Wysyłaj plik ZIP do przeglądarki
        res.attachment('exported_messages.zip');
        archive.pipe(res);
        archive.on("finish", () => {
            fs_1.promises.rm(tempDir, { recursive: true, force: true });
        });
    }
    catch (error) {
        console.error('Błąd podczas eksportowania plików .eml:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas eksportowania plików .eml.' });
    }
});
exports.exportMessagesEmlController = exportMessagesEmlController;
