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
exports.deleteTransportMessagesController = exports.deleteMessagesController = void 0;
const utils_1 = require("../../utils");
const data_source_1 = require("../../data-source");
const Message_1 = require("../../entity/Message");
const TransportMessages_1 = require("../../entity/TransportMessages");
const deleteMessagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const selectedMessageIds = req.body.messages;
    const messageRepository = (yield data_source_1.AppDataSource).getRepository(Message_1.Message);
    if (!selectedMessageIds || selectedMessageIds.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do usunięcia.' });
    }
    try {
        yield (0, utils_1.deleteSelectedMessagesFromDatabase)(selectedMessageIds, messageRepository);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Błąd podczas usuwania wiadomości:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas usuwania wiadomości.' });
    }
});
exports.deleteMessagesController = deleteMessagesController;
const deleteTransportMessagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const selectedMessageIds = req.body.messages;
    const messageRepository = (yield data_source_1.AppDataSource).getRepository(TransportMessages_1.TransportMessage);
    if (!selectedMessageIds || selectedMessageIds.length === 0) {
        return res.status(400).json({ error: 'Brak wiadomości do usunięcia.' });
    }
    try {
        yield (0, utils_1.deleteSelectedMessagesFromDatabase)(selectedMessageIds, messageRepository);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Błąd podczas usuwania wiadomości:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas usuwania wiadomości.' });
    }
});
exports.deleteTransportMessagesController = deleteTransportMessagesController;
