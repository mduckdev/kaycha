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
exports.messageDetailsController = void 0;
const data_source_1 = require("../../data-source");
const Message_1 = require("../../entity/Message");
const messageDetailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messageId = req.params.id;
    const messageRepository = (yield data_source_1.AppDataSource).getRepository(Message_1.Message);
    try {
        const messageDetails = yield messageRepository.findOneByOrFail({ id: Number(messageId) });
        res.render('message-details', { message: messageDetails });
    }
    catch (err) {
        console.error('Błąd podczas pobierania szczegółów wiadomości:', err.message);
        if (err.name === 'EntityNotFound') {
            return res.status(404).send('Wiadomość o podanym ID nie została znaleziona.');
        }
        else {
            return res.status(500).send('Wystąpił błąd podczas pobierania szczegółów wiadomości.');
        }
    }
});
exports.messageDetailsController = messageDetailsController;
