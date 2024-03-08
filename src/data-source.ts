import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Message } from "./entity/Message"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.db",
    synchronize: true,
    logging: true,
    entities: [User, Message],
    migrations: [],
    subscribers: [],
})
