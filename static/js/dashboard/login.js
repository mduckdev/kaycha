const sendForm = async (event) => {
    event?.preventDefault();
    const mfaCode = document.getElementById("mfa").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const params = new URLSearchParams();
    params.append("mfa", mfaCode);
    params.append("username", username);
    params.append("password", password);
    fetch("/auth/login", {
        method: "POST",
        body: params
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location = "/dashboard"
            }
            if (data.message === "MFA required") {
                showMfaModal("Wpisz kod z aplikacji uwierzytelniającej").then(() => {
                    sendForm();
                });
            } else if (data.message === "Invalid mfa code") {
                showMfaModal("Wpisz kod z aplikacji uwierzytelniającej", "Nieprawidłowy kod").then(() => {
                    sendForm();
                });
            }
            else {
                showModal(data.message);
            }

        })
        .catch(error => {
            console.error('Error:', error);
        });
}


document.getElementById("login-form").addEventListener("submit", sendForm);