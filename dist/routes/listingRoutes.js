"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingRoutes = void 0;
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = require("express-rate-limit");
const utils_1 = require("../utils");
const listing_1 = require("../controllers/listings/listing");
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
function listingRoutes() {
    const router = express_1.default.Router();
    router.use(requireAuth);
    router.use(dashboardLimiter);
    router.use(utils_1.assureCSRF);
    router.use(utils_1.verifyCSRF);
    router.get("/", new listing_1.listing().getIndex);
    router.get("/edit/:id", new listing_1.listing().getEdit);
    router.get("/add", new listing_1.listing().getAdd);
    router.put('/add', new listing_1.listing().put);
    router.patch('/edit/:id', new listing_1.listing().patch);
    router.delete("/delete/:id", new listing_1.listing().delete);
    return router;
}
exports.listingRoutes = listingRoutes;
