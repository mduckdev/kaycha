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
exports.logoutDevicesController = void 0;
const data_source_1 = require("../../data-source");
const Session_1 = require("../../entity/Session");
const logoutDevicesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const sessionRepository = (yield data_source_1.AppDataSource).getRepository(Session_1.Session);
        const sessions = yield sessionRepository.createQueryBuilder("sessions")
            .where("sessions.id != :id", { id: req.sessionID })
            .andWhere("sessions.json LIKE :userString", { userString: `%"username":"${(_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username}"%` })
            .andWhere("sessions.destroyedAt IS NULL")
            .update()
            .set({ destroyedAt: new Date() })
            .execute();
        console.log(sessions);
        res.json({ success: true });
    }
    catch (error) {
        res.json({ error: "Failed to logout from all devices" });
    }
});
exports.logoutDevicesController = logoutDevicesController;
