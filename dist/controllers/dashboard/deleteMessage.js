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
exports.deleteTransportMessageController = exports.deleteMessageController = void 0;
const data_source_1 = require("../../data-source");
const Message_1 = require("../../entity/Message");
const TransportMessages_1 = require("../../entity/TransportMessages");
const deleteMessageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messageId = req.body.messageId;
    const messageRepository = (yield data_source_1.AppDataSource).getRepository(Message_1.Message);
    const messageToRemove = yield messageRepository.findOneByOrFail({ id: Number(messageId) }).catch(error => {
        console.error(error);
        res.status(401).send("No such message").end();
        return;
    });
    if (messageToRemove) {
        yield messageRepository.remove(messageToRemove);
        return res.json({ success: true });
    }
});
exports.deleteMessageController = deleteMessageController;
const deleteTransportMessageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messageId = req.body.messageId;
    const messageRepository = (yield data_source_1.AppDataSource).getRepository(TransportMessages_1.TransportMessage);
    const messageToRemove = yield messageRepository.findOneByOrFail({ id: Number(messageId) }).catch(error => {
        console.error(error);
        res.status(401).send("No such message").end();
        return;
    });
    if (messageToRemove) {
        yield messageRepository.remove(messageToRemove);
        return res.json({ success: true });
    }
});
exports.deleteTransportMessageController = deleteTransportMessageController;
