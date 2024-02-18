const axios = require("axios");

module.exports = {
    dict: {
        "PL": {
            allFieldsRequired: "Wszystkie pola są wymagane",
            incorrectEmail: "Nieprawidłowy adres email",
            incorrectPhoneNumber: "Nieprawidłowy numer telefonu",
            incorrectCaptcha: "Weryfikacja hCaptcha nie powiodła się. Spróbuj ponownie.",
            errorCaptcha: "Wystąpił błąd podczas weryfikacji hCaptcha."
        }
    },


    validateContactForm: async (body, language, captchaSecretKey) => {
        let { firstName, lastName, phoneNumber, email, city, street, homeNumber, message, consent } = body;
        const hcaptchaResponse = body["g-recaptcha-response"];

        const response = {
            isValid: true,
            errorMessages: []
        }

        if (!firstName || !lastName || !phoneNumber || !email || !city || !street || !homeNumber || !message) {
            response.isValid = false;
            response.errorMessages.push(module.exports.dict[language].allFieldsRequired);
            return response;
        }


        const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
        const emailExpresion = new RegExp(emailRegex);
        if (!email.match(emailExpresion)) {
            response.isValid = false;
            response.errorMessages.push(module.exports.dict[language].incorrectEmail);

        }

        const phoneRegex = /^[\d\s\-()+]+$/;
        if (!phoneRegex.test(phoneNumber) || phoneNumber.length < 6) {
            response.isValid = false;
            response.errorMessages.push(module.exports.dict[language].incorrectPhoneNumber);
        }


        try {
            const params = new URLSearchParams();
            params.append("response", hcaptchaResponse);
            params.append("secret", captchaSecretKey);

            const verificationResponse = await axios.post('https://hcaptcha.com/siteverify', params);

            console.log(verificationResponse, params);
            if (!verificationResponse.data.success) {
                response.isValid = false;
                response.errorMessages.push(module.exports.dict[language].incorrectCaptcha);
            }
        } catch (error) {
            response.isValid = false;
            response.errorMessages.push(module.exports.dict[language].errorCaptcha);
            console.log(error)
        }

        return response;
    },

    setupDB: (db) => {
        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, firstName TEXT,lastName TEXT,phoneNumber TEXT, email TEXT,city TEXT,street TEXT,homeNumber TEXT,message TEXT)');
            db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username VARCHAR(30),password VARCHAR(150))');
        });
    }

}