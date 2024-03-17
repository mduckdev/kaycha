import request from "supertest";

import  { bootstrap } from "../src/index";
let app:any= null;

let cookie:string|null=null;

const authenticateUser = async () => {
    if(!cookie){
        let auth = await request(app)
        .post("/auth/login")
        .send({ username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASSWORD });
        cookie = auth.header["set-cookie"];
    }
    return cookie;
};

const getCSRFToken = async ()=>{
    let cookie = await authenticateUser();
    let res = await request(app).get("/dashboard/profile").set("Cookie", [cookie]);
    let html = res.text;
    const csrfTokenRegex = /<input id="csrfToken" type="hidden" name="csrfToken" value="(.+?)">/;
    const match = html.match(csrfTokenRegex);
    let csrfToken = match ? match[1] : null;
    return csrfToken;
}
beforeAll(async()=>{
    app = await bootstrap();
})


describe("Test dashboardRoutes.ts changeProfileController", () => {
    it("Tests 302 redirections to login", async () => {
        await request(app).get("/dashboard/profile").expect("Location", "/auth/login");
    });
    it("Tests csrf protection",async ()=>{
        let cookie = await authenticateUser();
        let res = await request(app).post("/dashboard/change-profile").set("Cookie", [cookie]).send({});
        expect(res.statusCode).toEqual(400),
            expect(res.text).toEqual("Failed to verify csrf token.")
    })
    it("Tests changing profile with sending empty body", async () => {
        let cookie = await authenticateUser();
        let csrfToken = await getCSRFToken();
        let res = await request(app).post("/dashboard/change-profile").set("Cookie", [cookie]).send({csrfToken:csrfToken});
        expect(res.statusCode).toEqual(401),
            expect(res.text).toEqual("Brakuje niezbędnych pól.")
    });
    it("Tests changing profile with sending wrong email", async () => {
        let cookie = await authenticateUser();
        let csrfToken = await getCSRFToken();
        let res = await request(app).post("/dashboard/change-profile").set("Cookie", [cookie]).send({
            newUsername: "test",
            currentPassword: "test",
            newPassword: "newEmail",
            newEmail: "makumba",
            csrfToken:csrfToken
        });
        expect(res.statusCode).toEqual(401),
            expect(res.text).toEqual("Nieprawidłowy email.")
    });
    it("Tests changing profile with sending wrong password", async () => {
        let cookie = await authenticateUser();
        let csrfToken = await getCSRFToken();
        let res = await request(app).post("/dashboard/change-profile").set("Cookie", [cookie]).send({
            newUsername: "test",
            currentPassword: "test",
            newPassword: "newEmail",
            newEmail: "",
            csrfToken:csrfToken
        });
        expect(res.statusCode).toEqual(401),
            expect(res.text).toEqual("Nieprawidłowe hasło.")
    });
    it("Tests changing profile with sending only new username", async () => {
        let cookie = await authenticateUser();
        let csrfToken = await getCSRFToken();
        await request(app).post("/dashboard/change-profile").set("Cookie", [cookie]).send({
            newUsername: process.env.DEFAULT_USER,
            currentPassword: "",
            newPassword: "",
            newEmail: "",
            csrfToken:csrfToken
        }).expect("Location", "/dashboard").expect(302)
    });
    it("Tests changing profile with sending username and password", async () => {
        let cookie = await authenticateUser();
        let csrfToken = await getCSRFToken();
        await request(app).post("/dashboard/change-profile").set("Cookie", [cookie]).send({
            newUsername: process.env.DEFAULT_USER,
            currentPassword: process.env.DEFAULT_PASSWORD,
            newPassword: process.env.DEFAULT_PASSWORD,
            newEmail: "",
            csrfToken:csrfToken
        }).expect("Location", "/dashboard").expect(302)
    });

});