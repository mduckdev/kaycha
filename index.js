const express = require('express');
const bodyParser = require('body-parser');
const { validateContactForm, setupDB } = require("./utils.js")
require('dotenv').config()
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database(process.env.DB_FILE || "database.db");
setupDB(db);

app.use(bodyParser.urlencoded({ extended: true }));


app.use("/", express.static("static"))
app.post("/api/contact", async (req, res) => {
    const { firstName, lastName, phoneNumber, email, city, street, homeNumber, message } = req.body;
    const response = await validateContactForm(req.body, "PL", process.env.HCAPTCHA_PRIVATE_KEY);
    const { isValid } = response;

    if (!isValid) {
        res.send(JSON.stringify(response));
        res.end();
        return;
    }

    db.run("INSERT INTO messages(firstName,lastName,phoneNumber,email,city,street,homeNumber,message) VALUES (?,?,?,?,?,?,?,?)", [firstName, lastName, phoneNumber, email, city, street, homeNumber, message], function (err) {
        if (err) {
            console.log("Error occured while adding message to database: " + err);
        } {
            console.log("Successfuly added new message to database from: " + firstName);
        }
    })

    res.send(response);
    res.end();

})


app.listen(port, () => {
    console.log(`Server is listening at port: ${port}`);
});

