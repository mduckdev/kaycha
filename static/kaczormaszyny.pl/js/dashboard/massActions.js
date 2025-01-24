document.addEventListener('DOMContentLoaded', function () {
    const actionForm = document.getElementById('actionForm');
    const messageCheckboxes = document.querySelectorAll('.messageCheckbox');

    actionForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedAction = document.getElementById('action').value;

        switch (selectedAction) {
            case 'export-csv':
                exportSelectedMessages('/dashboard/export-messages-csv', "exported_messages.csv");
                break;
            case 'export-eml':
                exportSelectedMessages('/dashboard/export-messages-eml', "exported_messages.zip");
                break;
            case 'delete':
                deleteSelectedMessages();
                break;
            default:
                console.error('Nieznana opcja akcji.');
        }
    });

    function exportSelectedMessages(url, filename) {
        const selectedMessages = getSelectedMessages();

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: selectedMessages,csrfToken:csrfToken }),
        })
            .then(response => response.blob())
            .then(blob => {
                if (blob.type.includes("application/json")) {
                    return;
                }
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch(error => console.error('Błąd podczas eksportowania:', error));
    }

    async function deleteSelectedMessages() {
        const selectedMessages = getSelectedMessages();
        const confirmation = await showConfirmModal(`Usunąć ${selectedMessages.length} wiadomości?`).catch(err=>console.log("Modal rejected."))
        if (!confirmation) {
            return;
        }
        // Wysyłanie żądania fetch do endpointu usuwania
        fetch('/dashboard/delete-messages', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: selectedMessages,csrfToken:csrfToken  }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showModal("Uwaga! "+data.error);
                    console.error(data.error);
                }
                else {
                    showModal('Zaznaczone wiadomości zostały pomyślnie usunięte: ').then(()=>{
                        window.location.href = window.location.href;
                    })
                }
            })
            .catch(error => console.error('Błąd podczas usuwania:', error));
    }


    function getSelectedMessages() {
        const selectedMessages = [];
        messageCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedMessages.push(checkbox.dataset.id);
            }
        });
        return selectedMessages;
    }
});
