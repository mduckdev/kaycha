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
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const utils_1 = require("./utils");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const data_source_1 = require("./data-source");
const dashboardRoutes_1 = require("./routes/dashboardRoutes");
const helmet_1 = __importDefault(require("helmet"));
require("reflect-metadata");
const apiRoutes_1 = require("./routes/apiRoutes");
const express_session_1 = __importDefault(require("express-session"));
const connect_typeorm_1 = require("connect-typeorm");
const Session_1 = require("./entity/Session");
const authRoutes_1 = require("./routes/authRoutes");
const listingRoutes_1 = require("./routes/listingRoutes");
dotenv_1.default.config();
const bootstrap = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    const port = Number(process.env.PORT) || 3000;
    if (process.env.NODE_ENV !== 'test') {
        (0, utils_1.setupDB)(process.env.DEFAULT_USER || "", process.env.DEFAULT_PASSWORD || "", Number(process.env.PASSWORD_HASH_ROUND) || 10);
    }
    app.disable("x-powered-by");
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use(body_parser_1.default.json());
    const sessionRepository = (yield data_source_1.AppDataSource).getRepository(Session_1.Session);
    app.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET || "cvsn4qrqjN6AbSwmIptfTXwbBkmrTq9SuvJkgqFKvTHUFQNcGLypOIrivgY0ns4N",
        name: "sessionID",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "strict",
            secure: (process.env.NODE_ENV == "production") ? true : false,
            httpOnly: true,
        },
        store: new connect_typeorm_1.TypeormStore({ cleanupLimit: 2 }).connect(sessionRepository)
    }));
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                "script-src": ["'self'", "https://code.jquery.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://*.hcaptcha.com", "https://hcaptcha.com"],
                "style-src": ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://*.hcaptcha.com", "https://hcaptcha.com", "https://fonts.googleapis.com"],
                "font-src": ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
                "img-src": ["'self'", "https://*.olxcdn.com", "https://cdnjs.cloudflare.com", "data:"],
                "frame-src": ["https://*.hcaptcha.com", "https://hcaptcha.com", "https://maps.googleapis.com"],
                "connect-src": ["'self'", "https://*.hcaptcha.com", "https://hcaptcha.com"]
            }
        },
    }));
    app.set('views', path_1.default.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.set('trust proxy', 1);
    app.use("/", express_1.default.static("static"));
    app.use("/dashboard", (0, dashboardRoutes_1.dashboardRoutes)());
    app.use("/api", (0, apiRoutes_1.apiRoutes)());
    app.use("/auth", (0, authRoutes_1.authRoutes)());
    app.use("/listings", (0, listingRoutes_1.listingRoutes)());
    if (process.env.NODE_ENV !== 'test') {
        app.listen(port, () => {
            console.log(`Server is running at: http://localhost:${port}`);
        });
    }
    return app;
});
exports.bootstrap = bootstrap;
(0, exports.bootstrap)();
