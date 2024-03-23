function logoutDevices() {
    fetch('/dashboard/logout-devices', {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ csrfToken: csrfToken })
    }).then(res => res.json())
        .then(response => {
            if (response.success) {
                showModal("Pomyślnie wylogowano ze wszystkich urządzeń")
            } else {
                showModal('Błąd podczas wylogowywania urządzeń', "Uwaga");
            }
        })
        .catch(error => {
            showModal('Błąd podczas wylogowywania urządzeń', "Uwaga").then(() => {
                console.error('Błąd podczas wylogowywania urządzeń:', error);
            })

        });
}
const logoutButton = document.getElementById("logout-button");
logoutButton.onclick = logoutDevices;


async function getMFALoginURI() {
    try {
        const response = await fetch('/dashboard/add-mfa'); // Zastąp 'URL_BACKEND_DO_ZAPYTANIA' adresem URL backendu
        const data = await response.json();
        return data.uri; // Załóżmy, że odpowiedź backendu zawiera pole 'uri' z URI do MFA
    } catch (error) {
        console.error('Błąd podczas pobierania URI MFA:', error);
        throw error;
    }
}
async function generateQRCode(uri) {
    try {
        const qrCodeDiv = document.getElementById('qrcode');
        const qr = qrcode(0, 'M');
        qr.addData(uri);
        qr.make();
        qrCodeDiv.innerHTML = qr.createImgTag(4, 0);
        console.log('Kod QR został wygenerowany.');
    } catch (error) {
        console.error('Błąd podczas generowania kodu QR:', error);
    }
}
async function main() {
    try {
        const uri = await getMFALoginURI();
        generateQRCode(uri);
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

// Wywołanie głównej funkcji po załadowaniu strony
window.onload = main;