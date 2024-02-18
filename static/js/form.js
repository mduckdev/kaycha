const contactForm = document.getElementById("contact-form");
const contactFormHandler = (e) => {
    //alert("Wysłano formularz");
    e.preventDefault();
    const formData = new FormData(e.target);
    const formDataObj = {};
    formData.forEach((value, key) => (formDataObj[key] = value));
    const params = new URLSearchParams(formDataObj);
    console.log(formDataObj)

    fetch('/api/contact', {
        method: 'POST',

        body: params
    })
        .then(response => response.json())
        .then(data => {
            if (data.isValid) {
                alert("Pomyślnie wysłano wiadomość.")
            } else {
                let s = "";
                data.errorMessages.forEach(x => s += x);
                alert(s);
            }
            console.log('Odpowiedź z serwera:', data);
            // Możesz wykonać dodatkowe operacje po wysłaniu formularza
        })
        .catch(error => console.error('Błąd:', error));

}

contactForm.onsubmit = contactFormHandler;