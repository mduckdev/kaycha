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
    getAsync: (sql, params = [], db) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    },


    validateContactForm: async (body, language, captchaSecretKey) => {
        let { firstName, lastName, phoneNumber, email, city, street, homeNumber, message, consent } = body;
        const hcaptchaResponse = body["g-recaptcha-response"];

        const response = {
            isValid: true,
            errorMessages: []
        }

        if (!firstName || !lastName || !phoneNumber || !email || !city || !street || !homeNumber || !message || consent != "on") {
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

    setupDB: async (db, username, password) => {
        await db.serialize(async () => {
            db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, firstName VARCHAR(30),lastName VARCHAR(30),phoneNumber VARCHAR(15), email VARCHAR(50),city VARCHAR(30),street VARCHAR(30),homeNumber VARCHAR(5),message VARCHAR(2000), timestamp INTEGER,ip_address VARCHAR(25),port_number VARCHAR(10) )');
            db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username VARCHAR(30) UNIQUE,password VARCHAR(150),email VARCHAR(50),mfa_enabled INTEGER, mfa_secret VARCHAR(100))');
            const isUser = await module.exports.getAsync("SELECT * FROM users", [], db);
            if (!isUser) {
                db.run('INSERT INTO users(username,password) VALUES (?,?)', [username, password]);
            }

        });
    },
    getSelectedMessagesFromDatabase: async (selectedMessageIds, db) => {
        return new Promise((resolve, reject) => {
            const placeholders = selectedMessageIds.map(() => '?').join(', ');
            const sql = `SELECT * FROM messages WHERE id IN (${placeholders})`;
            db.all(sql, selectedMessageIds, (err, rows) => {
                if (err) {
                    console.error('Błąd podczas pobierania wiadomości z bazy danych:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }

            });
        });
    },
    deleteSelectedMessagesFromDatabase: async (selectedMessageIds, db) => {
        return new Promise((resolve, reject) => {

            const placeholders = selectedMessageIds.map(() => '?').join(', ');
            const sql = `DELETE FROM messages WHERE id IN (${placeholders})`;

            db.run(sql, selectedMessageIds, function (err) {
                if (err) {
                    console.error('Błąd podczas usuwania wiadomości z bazy danych:', err);
                    reject(err);
                } else {
                    // Sprawdź, czy coś zostało usunięte
                    if (this.changes > 0) {
                        resolve();
                    } else {
                        reject(new Error('Brak wiadomości o podanych ID.'));
                    }
                }

            });
        });
    }

}