"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoutes = void 0;
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = require("express-rate-limit");
const contact_1 = require("../controllers/api/contact");
const getListings_1 = require("../controllers/api/getListings");
dotenv_1.default.config();
const contactLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
});
const listingsLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
});
function apiRoutes() {
    const router = express_1.default.Router();
    router.post("/contact", contactLimiter, contact_1.contactController);
    router.get("/get-listings", listingsLimiter, getListings_1.getListingsController);
    return router;
}
exports.apiRoutes = apiRoutes;
