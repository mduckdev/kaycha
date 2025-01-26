import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Message } from "./entity/Message"
import { Session } from "./entity/Session";
import { ResetEmail } from "./entity/ResetEmails";
import { Listing } from "./entity/Listing";
import { FleetVehicle } from "./entity/Fleet";
import { TransportMessage } from "./entity/TransportMessages";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.db",
    synchronize: true,
    logging: (process.env.NODE_ENV == "production") ? true : false,
    entities: [User, Message, Session, ResetEmail, Listing, FleetVehicle, TransportMessage],
    migrations: [],
    subscribers: [],
}).initialize().then(x => { return x }).catch(error => { console.error(error); throw error });

