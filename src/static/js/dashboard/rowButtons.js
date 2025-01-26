document.addEventListener('DOMContentLoaded',  () => {
    // Znajdź wszystkie przyciski usuwania
    const sendButtons = document.querySelectorAll('.send-button');
    // Dodaj obsługę kliknięcia dla każdego przycisku usuwania
    sendButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const messageId = button.getAttribute('data-id');
            const messageSource = button.getAttribute('data-src');

            // Wyślij żądanie do serwera w celu usunięcia rekordu o określonym ID
            const confirmation = await showConfirmModal(`Wysłać wiadomość nr: ${messageId}?`).catch(err=>console.log("Modal rejected."))
            const url = messageSource === "kaczortransport.pl"?"/dashboard/send-transport-message/":"/dashboard/send-message/";
            if (confirmation) {
                fetch(url, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }, 
                    body:JSON.stringify({csrfToken:csrfToken , messageId:messageId, src:messageSource})})
                    .then(response => response.json())
                    .then(data => {
                        // Przeładuj stronę po pomyślnym usunięciu rekordu
                        if (data.success) {
                            showModal("Pomyślnie wysłano wiadomość.")
                            window.location.reload();
                        } else {
                            console.error('Błąd podczas usuwania rekordu.');
                        }
                    })
                    .catch(error => console.error('Błąd podczas wysyłania żądania:', error));
            }

        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // Znajdź wszystkie przyciski usuwania
    const deleteButtons = document.querySelectorAll('.delete-button');

    // Dodaj obsługę kliknięcia dla każdego przycisku usuwania
    deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const messageId = button.getAttribute('data-id');
            const messageSource = button.getAttribute('data-src');
            // Wyślij żądanie do serwera w celu usunięcia rekordu o określonym ID
            const confirmation = await showConfirmModal(`Usunąć wiadomość nr: ${messageId}?`).catch(err=>console.log("Modal rejected."))
            const url = messageSource === "kaczortransport.pl"?"/dashboard/delete-transport-message/":"/dashboard/delete-message/";

            if (confirmation) {
                fetch(url, { 
                    method: 'DELETE',
                    headers: {
                    'Content-Type': 'application/json',
                    }, 
                    body:JSON.stringify({csrfToken:csrfToken , messageId:messageId })})
                    .then(response => response.json())
                    .then(data => {
                        // Przeładuj stronę po pomyślnym usunięciu rekordu
                        if (data.success) {
                            showModal("Pomyślnie usunięto wiadomość").then(()=>{
                                window.location.reload();
                            })
                        } else {
                            showModal('Błąd podczas usuwania rekordu',"Uwaga").then(()=>{
                                console.error(data);
                            });
                        }
                    })
                    .catch(error => {
                        showModal("Błąd podczas wysyłania żądania:","Uwaga").then(()=>{
                            console.error('Błąd podczas wysyłania żądania: ', error)
                        })
                    });
            }

        });
    });
});