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
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./entity/User");
const Message_1 = require("./entity/Message");
const Session_1 = require("./entity/Session");
const ResetEmails_1 = require("./entity/ResetEmails");
const Listing_1 = require("./entity/Listing");
const Fleet_1 = require("./entity/Fleet");
const TransportMessages_1 = require("./entity/TransportMessages");
const ListingsPreferences_1 = require("./entity/ListingsPreferences");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "sqlite",
    database: "database.db",
    synchronize: true,
    logging: (process.env.NODE_ENV == "production") ? true : false,
    entities: [User_1.User, Message_1.Message, Session_1.Session, ResetEmails_1.ResetEmail, Listing_1.Listing, Fleet_1.FleetVehicle, TransportMessages_1.TransportMessage, ListingsPreferences_1.ListingsPreferences],
    migrations: [],
    subscribers: [],
}).initialize().then((dataSource) => __awaiter(void 0, void 0, void 0, function* () {
    const listingsPrefRepository = dataSource.getRepository(ListingsPreferences_1.ListingsPreferences);
    const existingPreferences = yield listingsPrefRepository.findOne({ where: { id: 1 } });
    if (!existingPreferences) {
        const defaultPreferences = listingsPrefRepository.create();
        yield listingsPrefRepository.save(defaultPreferences);
    }
    return dataSource;
}))
    .catch(error => {
    console.error("Błąd podczas inicjalizacji bazy danych:", error);
    throw error;
});
