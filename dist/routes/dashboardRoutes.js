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
const express_rate_limit_1 = require("express-rate-limit");
const utils_1 = require("../utils");
const logoutDevices_1 = require("../controllers/dashboard/logoutDevices");
const mfa_1 = require("../controllers/dashboard/mfa");
dotenv_1.default.config();
const requireAuth = (req, res, next) => {
    var _a, _b;
    if (!((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id)) {
        return res.redirect("/auth/login");
    }
    else {
        next();
    }
};
const dashboardLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 1 * 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
});
function dashboardRoutes() {
    const router = express_1.default.Router();
    router.use(requireAuth);
    router.use(dashboardLimiter);
    router.use(utils_1.assureCSRF);
    router.use(utils_1.verifyCSRF);
    router.get('/', dashboard_1.dashboardController);
    router.get('/message-details/:id', messageDetails_1.messageDetailsController);
    router.get("/profile", profile_1.profileController);
    router.get("/add-mfa", new mfa_1.mfa().get);
    router.delete("/add-mfa", new mfa_1.mfa().delete);
    router.delete("/logout-devices/", logoutDevices_1.logoutDevicesController);
    router.delete('/delete-message/', deleteMessage_1.deleteMessageController);
    router.delete('/delete-messages/', deleteMessages_1.deleteMessagesController);
    router.post('/send-message/', sendMessage_1.sendMessageController);
    router.post("/add-mfa", new mfa_1.mfa().post);
    router.post("/change-profile", changeProfile_1.changeProfileController);
    router.post('/export-messages-csv', exportMessagesCsv_1.exportMessagesCsvController);
    router.post('/export-messages-eml', exportMessagesEml_1.exportMessagesEmlController);
    return router;
}
exports.dashboardRoutes = dashboardRoutes;
