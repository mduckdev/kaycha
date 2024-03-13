document.addEventListener('DOMContentLoaded', () => {
    // Znajdź wszystkie przyciski usuwania
    const sendButtons = document.querySelectorAll('.send-button');
    // Dodaj obsługę kliknięcia dla każdego przycisku usuwania
    sendButtons.forEach(button => {
        button.addEventListener('click', () => {
            const messageId = button.getAttribute('data-id');
            // Wyślij żądanie do serwera w celu usunięcia rekordu o określonym ID
            if (confirm(`Czy na pewno chcesz wysłać wiadomość nr: ${messageId}`)) {
                fetch(`/dashboard/send-message/`, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }, 
                    body:JSON.stringify({csrfToken:csrfToken , messageId:messageId})})
                    .then(response => response.json())
                    .then(data => {
                        // Przeładuj stronę po pomyślnym usunięciu rekordu
                        if (data.success) {
                            alert("Pomyślnie wysłano wiadomość.")
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
        button.addEventListener('click', () => {
            const messageId = button.getAttribute('data-id');
            // Wyślij żądanie do serwera w celu usunięcia rekordu o określonym ID
            if (confirm(`Czy na pewno chcesz usunąć wiadomość nr: ${messageId}`)) {
                fetch(`/dashboard/delete-message/`, { 
                    method: 'DELETE',
                    headers: {
                    'Content-Type': 'application/json',
                    }, 
                    body:JSON.stringify({csrfToken:csrfToken , messageId:messageId })})
                    .then(response => response.json())
                    .then(data => {
                        // Przeładuj stronę po pomyślnym usunięciu rekordu
                        if (data.success) {
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