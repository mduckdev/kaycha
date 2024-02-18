const express = require('express');
const bodyParser = require('body-parser');
const { validateContactForm } = require("./utils.js")

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));


app.use("/", express.static("static"))
app.post("/api/contact", (req, res) => {
    const { firstName, lastName, phoneNumber, email, city, street, homeNumber, message } = req.body;
    const response = validateContactForm(req.body, "PL");
    const { isValid, errorMessages } = response;

    if (!isValid) {
        res.send(JSON.stringify(response));
        res.end();
        return;
    }



    res.send(response);
    res.end();

})


app.listen(port, () => {
    console.log(`Server is listening at port: ${port}`);
});

