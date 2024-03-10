import request from "supertest";

import app from "../src/index";

describe("Test dashboardRoutes.ts changeProfileController", () => {

    it("Tests 302 redirections to login", async () => {
        await request(app).get("/dashboard/profile").expect("Location", "/login");
    });
    it("Tests changing profile with sending empty body", async () => {
        let auth = await request(app)
            .post("/login")
            .send({ username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD });
        let cookie = auth.header["set-cookie"];
        let res = await request(app).post("/dashboard/change-profile").set("Cookie", [cookie]).send({});
        expect(res.statusCode).toEqual(401),
            expect(res.text).toEqual("Brakuje niezbędnych pól.")
    });
    it("Tests changing profile with sending wrong email", async () => {
        let auth = await request(app)
            .post("/login")
            .send({ username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD });
        let cookie = auth.header["set-cookie"];
        let res = await request(app).post("/dashboard/change-profile").set("Cookie", [cookie]).send({
            newUsername: "test",
            currentPassword: "test",
            newPassword: "newEmail",
            newEmail: "makumba"
        });
        expect(res.statusCode).toEqual(401),
            expect(res.text).toEqual("Nieprawidłowy email.")
    });
    it("Tests changing profile with sending wrong password", async () => {
        let auth = await request(app)
            .post("/login")
            .send({ username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD });
        let cookie = auth.header["set-cookie"];
        let res = await request(app).post("/dashboard/change-profile").set("Cookie", [cookie]).send({
            newUsername: "test",
            currentPassword: "test",
            newPassword: "newEmail",
            newEmail: ""
        });
        expect(res.statusCode).toEqual(401),
            expect(res.text).toEqual("Nieprawidłowe hasło.")
    });
    it("Tests changing profile with sending only new username", async () => {
        let auth = await request(app)
            .post("/login")
            .send({ username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD });
        let cookie = auth.header["set-cookie"];
        await request(app).post("/dashboard/change-profile").set("Cookie", [cookie]).send({
            newUsername: process.env.DEFAULT_USER,
            currentPassword: "",
            newPassword: "",
            newEmail: ""
        }).expect("Location", "/dashboard").expect(302)
    });
    it("Tests changing profile with sending username and password", async () => {
        let auth = await request(app)
            .post("/login")
            .send({ username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD });
        let cookie = auth.header["set-cookie"];
        await request(app).post("/dashboard/change-profile").set("Cookie", [cookie]).send({
            newUsername: process.env.DEFAULT_USER,
            currentPassword: process.env.DEFAULT_PASSWORD,
            newPassword: process.env.DEFAULT_PASSWORD,
            newEmail: ""
        }).expect("Location", "/dashboard").expect(302)
    });

});