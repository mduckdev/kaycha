import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Message } from "./entity/Message"
import { Session } from "./entity/Session";
import { ResetEmail } from "./entity/ResetEmails";
import { Listing } from "./entity/Listing";
import { FleetVehicle } from "./entity/Fleet";
import { TransportMessage } from "./entity/TransportMessages";
import { ListingsPreferences } from "./entity/ListingsPreferences";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.db",
    synchronize: true,
    logging: (process.env.NODE_ENV == "production") ? true : false,
    entities: [User, Message, Session, ResetEmail, Listing, FleetVehicle, TransportMessage, ListingsPreferences],
    migrations: [],
    subscribers: [],
}).initialize().then(async (dataSource) => { 
    const listingsPrefRepository = dataSource.getRepository(ListingsPreferences);
    const existingPreferences = await listingsPrefRepository.findOne({ where: { id: 1 } });
    if (!existingPreferences) {
        const defaultPreferences = listingsPrefRepository.create(); 
        await listingsPrefRepository.save(defaultPreferences);
    }
    return dataSource;
})
.catch(error => {
    console.error("Błąd podczas inicjalizacji bazy danych:", error);
    throw error;
});

