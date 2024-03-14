import request from "supertest";
import {bootstrap} from "../src/index";
let app:any= null;

beforeAll(async()=>{
    app = await bootstrap();
})

describe("Test apiRoutes.ts contact form", () => {
    it("Tests sending message with required values but incorrect phone number and incorrect email", async () => {
        let res = await request(app).post("/api/contact").send({
            firstName: "Sample name",
            lastName: "",
            phoneNumber: "test",
            email: "foor.com",
            city: "Sample city",
            street: "Sample street",
            homeNumber: "125",
            message: "Message",
            consent: "on"
        });
        expect(res.statusCode).toEqual(400),
            expect(res.body).toEqual(expect.objectContaining({ "isValid": false, "errorMessages": ["Nieprawidłowy adres email", "Nieprawidłowy numer telefonu"] }))
    });
    it("Tests sending message with required values but incorrect phone number", async () => {
        let res = await request(app).post("/api/contact").send({
            firstName: "Sample name",
            lastName: "",
            phoneNumber: "test",
            email: "foo@bar.com",
            city: "Sample city",
            street: "Sample street",
            homeNumber: "125",
            message: "Message",
            consent: "on"
        });
        expect(res.statusCode).toEqual(400),
            expect(res.body).toEqual(expect.objectContaining({ "isValid": false, "errorMessages": ["Nieprawidłowy numer telefonu"] }))
    });
    it("Tests sending message with required values but incorrect email", async () => {
        let res = await request(app).post("/api/contact").send({
            firstName: "Sample name",
            lastName: "",
            phoneNumber: "2312141",
            email: "test",
            city: "Sample city",
            street: "Sample street",
            homeNumber: "125",
            message: "Message",
            consent: "on"
        });
        expect(res.statusCode).toEqual(400),
            expect(res.body).toEqual(expect.objectContaining({ "isValid": false, "errorMessages": ["Nieprawidłowy adres email"] }))
    });
    it("Tests sending message with required values missing", async () => {
        let res = await request(app).post("/api/contact").send({
            firstName: "Sample name",
            lastName: "",
            phoneNumber: "2312141",
            email: "foo@bar.com",
            city: "Sample city",
            street: "Sample street",
            homeNumber: "125",
            message: "Message",
        });
        expect(res.statusCode).toEqual(400),
            expect(res.body).toEqual(expect.objectContaining({ "isValid": false, "errorMessages": ["Wszystkie pola są wymagane"] }))
    });
    it("Tests sending message with all values correct", async () => {
        let res = await request(app).post("/api/contact").send({
            firstName: "Sample name",
            lastName: "",
            phoneNumber: "2312141",
            email: "foo@bar.com",
            city: "Sample city",
            street: "Sample street",
            homeNumber: "125",
            message: "Message",
            consent: "on"
        });
        expect(res.statusCode).toEqual(200),
            expect(res.body).toEqual(expect.objectContaining({ "isValid": true, "errorMessages": [] }))
    });
});
