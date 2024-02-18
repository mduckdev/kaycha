module.exports = {
    dict: {
        "PL": {
            allFieldsRequired: "Wszystkie pola są wymagane",
            incorrectEmail: "Nieprawidłowy adres email",
        }
    },


    validateContactForm: (body, language) => {

        let { firstName, lastName, phoneNumber, email, city, street, homeNumber, message } = body;
        const response = {
            isValid: true,
            errorMessages: []
        }

        console.log(body);
        if (!firstName || !lastName || !phoneNumber || !email || !city || !street || !homeNumber || !message) {
            response.isValid = false;
            response.errorMessages.push(module.exports.dict[language].allFieldsRequired);
            return response;
        }

        const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
        const emailExpresion = new RegExp(emailRegex);
        if (!email.match(emailExpresion)) {
            response.isValid = false;
            response.errorMessages.push(module.exports.dict[language].allFieldsRequired);
            return response
        } else {
            email = email.match(emailExpresion)[0];

        }




        return response;
    }
}