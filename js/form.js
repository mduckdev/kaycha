const contactForm = document.getElementById("contact-form");
const contactFormHandler = (e) => {
    alert("Wysłano formularz");
    e.preventDefault();
}

contactForm.onsubmit = contactFormHandler;