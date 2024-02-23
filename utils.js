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
    },
    randomProperty: (obj) => {
        let keys = Object.keys(obj);
        return obj[keys[keys.length * Math.random() << 0]];
    },
    notifyAboutMessages: async (transporter, newMessages) => {
        let text = "nowych wiadomości";
        if (newMessages == 1) {
            text = "nową wiadomość";
        } else if (newMessages < 5) {
            text = "nowe wiadomości"
        }
        const plainTextMessage =
            `Masz ${newMessages} ${text}!
            Odwiedź kaczormaszyny.pl/dashboard żeby je przejżeć.`;
        const htmlMessage =
            `
            <h1>ℹ️ Masz ${newMessages} ${text}!</h1><br>
            <h3>🔗Odwiedź <a href="https://kaczormaszyny.pl/dashboard">panel zarządzania</a> żeby je przejrzeć.</h3>
        `
        const emailObject = {
            from: `"System powiadomień" <${process.env.EMAIL_USER_ADDRESS}>`, // sender address
            to: process.env.EMAIL_DESTINATION, // list of receivers
            subject: `Masz ${newMessages} ${text}`, // Subject line
            text: plainTextMessage, // plain text body
            html: htmlMessage, // html body
        }

        await transporter.sendMail(emailObject).then(x => {
            console.log("Pomyślnie wysłano powiadomienie o nowych wiadomościach");
        }).catch(err => { console.error(err); })
    }

}