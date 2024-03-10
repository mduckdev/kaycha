"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./entity/User");
const Message_1 = require("./entity/Message");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "sqlite",
    database: "database.db",
    synchronize: true,
    logging: (process.env.NODE_ENV == "production") ? true : false,
    entities: [User_1.User, Message_1.Message],
    migrations: [],
    subscribers: [],
}).initialize().then(x => { return x; });
