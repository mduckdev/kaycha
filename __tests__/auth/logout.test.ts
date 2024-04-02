import request from "supertest";
import { bootstrap } from "../../src/index";
import dotenv from "dotenv"
dotenv.config();
let app: any = null;

beforeAll(async () => {
    app = await bootstrap();
})
describe("Test auth/logout route", () => {
    //-----logout tests-----
    it("Tests logout mechanism", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD });
        expect(res.body).toEqual(expect.objectContaining({ success: true, message: "Successfull login" }))

        await request(app)
            .get("/auth/logout")
            .expect("Location", "/");
        await request(app)
            .get("/dashboard")
            .expect("Location", "/auth/login");
    })
    //-----logout tests-----

});