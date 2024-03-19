import request from "supertest";
import { bootstrap } from "../../src/index";
import dotenv from "dotenv"
dotenv.config();
let app: any = null;

beforeAll(async () => {
    app = await bootstrap();
})
describe("Test auth/password-reset route", () => {
    it("Tries ", async () => {

    })

});