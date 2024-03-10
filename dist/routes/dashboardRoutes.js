"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const dashboard_1 = require("../controllers/dashboard/dashboard");
const deleteMessage_1 = require("../controllers/dashboard/deleteMessage");
const sendMessage_1 = require("../controllers/dashboard/sendMessage");
const messageDetails_1 = require("../controllers/dashboard/messageDetails");
const changeProfile_1 = require("../controllers/dashboard/changeProfile");
const exportMessagesCsv_1 = require("../controllers/dashboard/exportMessagesCsv");
const exportMessagesEml_1 = require("../controllers/dashboard/exportMessagesEml");
const deleteMessages_1 = require("../controllers/dashboard/deleteMessages");
const profile_1 = require("../controllers/dashboard/profile");
dotenv_1.default.config();
const requireAuth = (req, res, next) => {
    var _a;
    if (!((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.id)) {
        return res.redirect('/login');
    }
    else {
        next();
    }
};
function dashboardRoutes() {
    const router = express_1.default.Router();
    router.use(requireAuth);
    router.get('/', dashboard_1.dashboardController);
    router.delete('/delete-message/:id', deleteMessage_1.deleteMessageController);
    router.get('/send-message/:id', sendMessage_1.sendMessageController);
    router.get('/message-details/:id', messageDetails_1.messageDetailsController);
    router.get("/profile", profile_1.profileController);
    router.post("/change-profile", changeProfile_1.changeProfileController);
    router.post('/export-messages-csv', exportMessagesCsv_1.exportMessagesCsvController);
    router.post('/export-messages-eml', exportMessagesEml_1.exportMessagesEmlController);
    router.delete('/delete-messages', deleteMessages_1.deleteMessagesController);
    return router;
}
exports.dashboardRoutes = dashboardRoutes;
