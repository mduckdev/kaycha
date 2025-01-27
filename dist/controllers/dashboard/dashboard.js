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
exports.dashboardController = void 0;
const data_source_1 = require("../../data-source");
const Message_1 = require("../../entity/Message");
const TransportMessages_1 = require("../../entity/TransportMessages");
const dashboardController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sortColumns = {
        "firstName": "firstName",
        "lastName": "lastName",
        "phoneNumber": "phoneNumber",
        "email": "email",
        "message": "message",
    };
    const searchQuery = (!req.query.search) ? "%%" : ("%" + req.query.search + "%");
    const sortBy = sortColumns[String(req.query.sortBy)] || 'id';
    const sortDirection = String(req.query.sortDirection) || 'desc'; // Domyślnie malejąco
    try {
        const messageRepository = (yield data_source_1.AppDataSource).getRepository(Message_1.Message);
        const messages = yield messageRepository.createQueryBuilder('message')
            .where('message.firstName LIKE :searchQuery OR message.lastName LIKE :searchQuery OR message.phoneNumber LIKE :searchQuery OR message.email LIKE :searchQuery OR message.city LIKE :searchQuery OR message.street LIKE :searchQuery OR message.homeNumber LIKE :searchQuery OR message.message LIKE :searchQuery', { searchQuery })
            .orderBy(`message.${sortBy}`, sortDirection == "asc" ? "ASC" : "DESC")
            .getMany();
        const transportMessageRepository = (yield data_source_1.AppDataSource).getRepository(TransportMessages_1.TransportMessage);
        const transportMessages = yield transportMessageRepository.createQueryBuilder('message')
            .where('message.firstName LIKE :searchQuery OR message.lastName LIKE :searchQuery OR message.phoneNumber LIKE :searchQuery OR message.email LIKE :searchQuery OR message.unloadingAddress LIKE :searchQuery OR message.loadingAddress LIKE :searchQuery OR message.message LIKE :searchQuery', { searchQuery })
            .orderBy(`message.${sortBy}`, sortDirection == "asc" ? "ASC" : "DESC")
            .getMany();
        res.render('dashboard', { messages: [...messages, ...transportMessages], user: req.session.user, csrfToken: req.session.csrfToken });
    }
    catch (error) {
        console.error('Error occurred while fetching messages from the database:', error);
        res.status(500).send('Internal Server Error');
    }
});
exports.dashboardController = dashboardController;
