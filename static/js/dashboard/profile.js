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
                showModal("Pomyślnie wylogowano ze wszystkich urządzeń").then(() => {
                    window.location.href = window.location.href;
                })
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
try {
    const logoutButton = document.getElementById("logout-button");
    logoutButton.onclick = logoutDevices;
} catch (e) {
    console.error(e);
}

async function addMfa(e) {
    const mfaToken = document.getElementById("mfaToken").value;
    fetch('/dashboard/add-mfa', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ csrfToken: csrfToken, mfaToken: mfaToken })
    }).then(res => res.json())
        .then(response => {
            if (response.success) {
                showModal("Pomyślnie dodano uwierzytelnianie dwuetapowe")
            } else {
                showModal('Błąd podczas dodawania uwierzytelniania dwuetapowego, sprawdź ponownie wpisany kod', "Uwaga");
            }
        })
        .catch(error => {
            showModal('Błąd podczas dodawania uwierzytelniania dwuetapowego, sprawdź ponownie wpisany kod', "Uwaga").then(() => {
                console.error('Błąd podczas dodawania uwierzytelniania dwuetapowego', error);
            })

        });
}
try {
    const mfaSubmitButton = document.getElementById("mfaSubmit");
    mfaSubmitButton.onclick = addMfa
} catch (e) {
    console.error(e);
}



async function removeMfa(e) {
    fetch('/dashboard/add-mfa', {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ csrfToken: csrfToken })
    }).then(res => res.json())
        .then(response => {
            if (response.success) {
                showModal("Pomyślnie usunięto uwierzytelnianie wieloetapowe")
            } else {
                showModal('Błąd podczas usuwania uwierzytelniania wieloetapowego', "Uwaga");
            }
        })
        .catch(error => {
            showModal('Błąd podczas usuwania uwierzytelniania wieloetapowego, sprawdź ponownie wpisany kod', "Uwaga").then(() => {
                console.error('Błąd podczas dodawania uwierzytelniania wieloetapowego', error);
            })

        });
}
try {
    const mfaRemoveButton = document.getElementById("mfaReset");
    mfaRemoveButton.onclick = removeMfa
} catch (e) {
    console.error(e);
}



async function getMFALoginURI() {
    try {
        const response = await fetch('/dashboard/add-mfa');
        const data = await response.json();
        return data.uri;
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

window.onload = main;