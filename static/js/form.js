const form = document.getElementById("contact-form");
const iti = intlTelInput(input);
const contactFormHandler = (e) => {
    //alert("Wysłano formularz");
    e.preventDefault();
    const formData = new FormData(e.target);
    const formDataObj = {};
    formData.forEach((value, key) => (formDataObj[key] = value));
    formDataObj["phoneNumber"] = iti.getNumber();
    const params = new URLSearchParams(formDataObj);

    fetch('/api/contact', {
        method: 'POST',

        body: params
    })
        .then(response => response.json())
        .then(data => {
            if (data.isValid) {
                alert("Pomyślnie wysłano wiadomość.");
                hcaptcha.reset();
                window.location.href = window.location.href;
            } else {
                let s = "";
                data.errorMessages.forEach(x => s += (x + "\n"));
                alert(s);
                hcaptcha.reset();
            }
        })
        .catch(error => console.error('Błąd:', error));

}

form.onsubmit = contactFormHandler;