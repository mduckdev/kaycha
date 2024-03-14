import request from "supertest";
import {bootstrap} from "../src/index";
import dotenv from "dotenv"
import { setupTests } from "./helpers/testSetup";
dotenv.config();
let app:any= null;

beforeAll(async()=>{
    app = await bootstrap();
    await setupTests();
})
describe("Test index.ts login system", () => {
    it("Tests login attemp with invalid credentials", async () => {
        await request(app)
            .post("/login")
            .send({ username: "test", password: "test" })
            .expect("Location", "/login")
    });
    it("Tests login attemp with valid username but wrong password", async () => {
        await request(app)
            .post("/login")
            .send({ username: process.env.DEFAULT_USER, password: "test" })
            .expect("Location", "/login")
    });
    it("Tests login attemp with invalid username but correct password", async () => {

        await request(app)
            .post("/login")
            .send({ username: "test", password: process.env.DEFAULT_PASSWORD })
            .expect("Location", "/login")
    });
    it("Tests login attemp with invalid parameters", async () => {
        await request(app)
            .post("/login")
            .send({ usernameae: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD })
            .expect("Location", "/login")
    });
    it("Tests login attemp with invalid parameters", async () => {
        await request(app)
            .post("/login")
            .send({ usernameae: process.env.DEFAULT_USER, passwordee: process.env.DEFAULT_PASSWORD })
            .expect("Location", "/login")
    });
    it("Tests login attemp with valid credentials", async () => {
        await request(app)
            .post("/login")
            .send({ username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD })
            .expect("Location", "/dashboard")
    });
});