import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Message } from "./entity/Message"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.db",
    synchronize: true,
    logging: (process.env.NODE_ENV == "production") ? true : false,
    entities: [User, Message],
    migrations: [],
    subscribers: [],
}).initialize().then(x => { return x });

