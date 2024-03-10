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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const utils_1 = require("./utils");
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = require("express-rate-limit");
const data_source_1 = require("./data-source");
const User_1 = require("./entity/User");
const dashboardRoutes_1 = require("./routes/dashboardRoutes");
require("reflect-metadata");
const apiRoutes_1 = require("./routes/apiRoutes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3000;
(0, utils_1.setupDB)(process.env.DEFAULT_USER || "", process.env.DEFAULT_PASSWORD || "", Number(process.env.PASSWORD_HASH_ROUND) || 10);
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use((0, express_session_1.default)({ secret: process.env.SESSION_SECRET || "cvsn4qrqjN6AbSwmIptfTXwbBkmrTq9SuvJkgqFKvTHUFQNcGLypOIrivgY0ns4N", resave: false, saveUninitialized: false, cookie: { maxAge: 24 * 60 * 60 * 1000, sameSite: "strict", secure: true, httpOnly: true, } }));
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);
const loginLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 1 * 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 100 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { isValid: false, errorMessages: ["Przekroczono limit zapytań. Proszę spróbować ponownie później."] }
});
app.use("/", express_1.default.static("static"));
app.use("/dashboard", (0, dashboardRoutes_1.dashboardRoutes)());
app.use("/api", (0, apiRoutes_1.apiRoutes)());
app.get('/login', (req, res) => {
    res.render("login");
});
app.post('/login', loginLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username = "", password = "" } = req.body;
    try {
        // Get repository for User entity
        const userRepository = (yield data_source_1.AppDataSource).getRepository(User_1.User);
        // Retrieve user from the database by username
        const user = yield userRepository.findOneBy({ "username": username });
        // Check if the user exists and the password is correct
        if (user && bcrypt_1.default.compareSync(password, user.password)) {
            console.log(`Successfull login for user ${user.username} from ${((_a = req === null || req === void 0 ? void 0 : req.header('x-forwarded-for')) === null || _a === void 0 ? void 0 : _a.split(",")[0]) || req.socket.remoteAddress}:${req.socket.remotePort}`);
            req.session.user = user;
            return res.redirect('/dashboard');
        }
        else {
            return res.redirect('/login');
        }
    }
    catch (error) {
        console.error('Error occurred during login:', error);
        res.status(500).send('Internal Server Error').end();
    }
}));
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err)
            console.error(err);
        res.redirect("/");
    });
});
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running at: http://localhost:${port}`);
    });
}
exports.default = app;
