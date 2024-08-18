"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("../utils");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const login_1 = require("../controllers/auth/login");
const logout_1 = require("../controllers/auth/logout");
const passwordReset_1 = require("../controllers/auth/passwordReset");
dotenv_1.default.config();
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, message: "Przekroczono limit zapytań. Proszę spróbować ponownie później." }
});
const passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 24 * 60 * 60 * 1000, // 24 hour
    max: 5, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, message: "Przekroczono limit zapytań. Proszę spróbować ponownie później." }
});
function authRoutes() {
    const router = express_1.default.Router();
    //router.use(requireAuth);
    //router.use(dashboardLimiter);
    router.use(utils_1.assureCSRF);
    router.get('/login', login_1.loginController);
    router.post('/login', loginLimiter, login_1.loginPostController);
    router.get('/logout', logout_1.logoutController);
    router.get("/password-reset", new passwordReset_1.passwordReset().get);
    router.post("/password-reset", passwordResetLimiter, new passwordReset_1.passwordReset().post);
    router.get("/password-reset/confirm/:token", passwordResetLimiter, new passwordReset_1.passwordReset().confirm);
    router.patch("/password-reset", passwordResetLimiter, new passwordReset_1.passwordReset().patch);
    return router;
}
exports.authRoutes = authRoutes;
