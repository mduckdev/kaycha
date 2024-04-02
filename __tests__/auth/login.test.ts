import request from "supertest";
import { bootstrap } from "../../src/index";
import dotenv from "dotenv"
dotenv.config();
let app: any = null;

beforeAll(async () => {
    app = await bootstrap();
})
describe("Test auth/login route", () => {
    //-----login tests-----
    it("Tests login attemp with invalid credentials", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ username: "test", password: "test" });
        expect(res.body).toEqual(expect.objectContaining({ success: false, message: "Nieprawidłowe dane do logowania" }))


    });
    it("Tests login attemp with valid username but wrong password", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ username: process.env.DEFAULT_USER, password: "test" });
        expect(res.body).toEqual(expect.objectContaining({ success: false, message: "Nieprawidłowe dane do logowania" }))

    });
    it("Tests login attemp with invalid username but correct password", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ username: "test", password: process.env.DEFAULT_PASSWORD });
        expect(res.body).toEqual(expect.objectContaining({ success: false, message: "Nieprawidłowe dane do logowania" }))

    });
    it("Tests login attemp with invalid parameters", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ usernameae: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD });
        expect(res.body).toEqual(expect.objectContaining({ success: false, message: "Nieprawidłowe dane do logowania" }))

    });
    it("Tests login attemp with invalid parameters", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ usernameae: process.env.DEFAULT_USER, passwordee: process.env.DEFAULT_PASSWORD })
        expect(res.body).toEqual(expect.objectContaining({ success: false, message: "Nieprawidłowe dane do logowania" }))

    });
    it("Tests login attemp with valid credentials", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD });
        expect(res.body).toEqual(expect.objectContaining({ success: true, message: "Successfull login" }))
    });
    //-----login tests-----

});