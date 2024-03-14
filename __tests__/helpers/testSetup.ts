import { setupDB } from "../../src/utils";
let setupCompleted = false;
export const setupTests = async ()=>{
    if(setupCompleted){
        return;
    }
    try {
        await setupDB(process.env.DEFAULT_USER || "admin", process.env.DEFAULT_PASSWORD || "admin", Number(process.env.PASSWORD_HASH_ROUND)|| 10);
        setupCompleted=true;
    } catch (error) {
        console.error('Error during database setup:', error);
        throw error;
    }
}