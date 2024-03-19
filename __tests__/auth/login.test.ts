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
        await request(app)
            .post("/auth/login")
            .send({ username: "test", password: "test" })
            .expect("Location", "/auth/login")
    });
    it("Tests login attemp with valid username but wrong password", async () => {
        await request(app)
            .post("/auth/login")
            .send({ username: process.env.DEFAULT_USER, password: "test" })
            .expect("Location", "/auth/login")
    });
    it("Tests login attemp with invalid username but correct password", async () => {

        await request(app)
            .post("/auth/login")
            .send({ username: "test", password: process.env.DEFAULT_PASSWORD })
            .expect("Location", "/auth/login")
    });
    it("Tests login attemp with invalid parameters", async () => {
        await request(app)
            .post("/auth/login")
            .send({ usernameae: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD })
            .expect("Location", "/auth/login")
    });
    it("Tests login attemp with invalid parameters", async () => {
        await request(app)
            .post("/auth/login")
            .send({ usernameae: process.env.DEFAULT_USER, passwordee: process.env.DEFAULT_PASSWORD })
            .expect("Location", "/auth/login")
    });
    it("Tests login attemp with valid credentials", async () => {
        await request(app)
            .post("/auth/login")
            .send({ username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD })
            .expect("Location", "/dashboard")
    });
    //-----login tests-----

    //-----logout tests-----
    it("Tests logout mechanism", async () => {
        await request(app)
            .post("/auth/login")
            .send({ username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD })
            .expect("Location", "/dashboard");
        await request(app)
            .get("/auth/logout")
            .expect("Location", "/");
        await request(app)
            .get("/dashboard")
            .expect("Location", "/auth/login");
    })
    //-----logout tests-----

});