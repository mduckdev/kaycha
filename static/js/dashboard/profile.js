 function logoutDevices() {
    fetch('/dashboard/logout-devices', {
        method: 'DELETE',
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({csrfToken:csrfToken})
    }).then(res=>res.json())
    .then(response => {
        if (response.success) {
            showModal("Pomyślnie wylogowano ze wszystkich urządzeń")
        } else {
            showModal('Błąd podczas wylogowywania urządzeń',"Uwaga");
        }
    })
    .catch(error => {
        showModal('Błąd podczas wylogowywania urządzeń',"Uwaga").then(()=>{
            console.error('Błąd podczas wylogowywania urządzeń:', error);
        })

    });
}
const logoutButton = document.getElementById("logout-button");
logoutButton.onclick = logoutDevices;