document.getElementById("resetForm")?.addEventListener("submit", function(event){
    event.preventDefault(); 

    let email = document.getElementById("email").value;
    let formData = new URLSearchParams();
    formData.append("email", email);

    // Wyślij żądanie POST
    fetch("/auth/password-reset", {
        method: "POST",
        body: formData
    })
    .then(response => response.json()) // Parsuj odpowiedź jako JSON
    .then(data => {
        // Wyświetl odpowiedź w alercie
        showModal(data.message);
    })
    .catch(error => {
        showModal("Wystąpił błąd podczas przetwarzania żądania.","Uwaga").then(()=>{
            console.error('Błąd:', error);
        })
    });
});
document.getElementById("passwordResetUpdate")?.addEventListener("submit", function(event){
    event.preventDefault(); 

    let password = document.getElementById("password").value;
    let token = document.getElementById("token").value;

    let formData = new URLSearchParams();
    formData.append("password", password);
    formData.append("token", token);


    // Wyślij żądanie POST
    fetch("/auth/password-reset", {
        method: "PATCH",
        body: formData
    })
    .then(response => response.json()) // Parsuj odpowiedź jako JSON
    .then(data => {
        // Wyświetl odpowiedź w alercie
        showModal(data.message).then(()=>{
            window.location="/auth/login";
        })
    })
    .catch(error => {
        showModal("Wystąpił błąd podczas przetwarzania żądania.","Uwaga").then(()=>{
            console.error('Błąd:', error);
        })
    });
});