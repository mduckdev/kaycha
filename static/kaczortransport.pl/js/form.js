const form = document.getElementById("contact-form");
const iti = intlTelInput(input);
const contactFormHandler = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formDataObj = {};
    formData.forEach((value, key) => (formDataObj[key] = value));
    formDataObj["phoneNumber"] = iti.getNumber();
    const params = new URLSearchParams(formDataObj);
    params.append("transport","true");
    fetch(`${backendURL}/api/contact`, {
        method: 'POST',
        body: params
    })
        .then(response => response.json())
        .then(data => {
            if (data.isValid) {
                showModal("Pomyślnie wysłano wiadomość").then(()=>{
                    hcaptcha.reset();
                    window.location.href = window.location.href;
                });
                
            } else {
                let s = "";
                data.errorMessages.forEach(x => s += (x + "\n"));
                showModal(s,"Błąd").then(()=>{
                    hcaptcha.reset();
                })
            }
        })
        .catch(error => console.error('Błąd:', error));

}

form.onsubmit = contactFormHandler;