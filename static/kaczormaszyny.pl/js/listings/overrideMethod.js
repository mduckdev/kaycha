
document.addEventListener('DOMContentLoaded', function () {
    const forms = document.querySelectorAll('form[httpMethod]');
    forms.forEach(form => {
        const httpMethod = form.getAttribute('httpMethod');
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            if (httpMethod === "DELETE") {
                if (!(await showConfirmModal("Czy na pewno usunąć?"))) {
                    return;
                }
            }

            const formData = new FormData(form);
            const formDataObj = {};
            formData.forEach((value, key) => (formDataObj[key] = value));
            const params = new URLSearchParams(formDataObj);
            const url = form.getAttribute('action');
            const response = await fetch(url, {
                method: httpMethod || "POST",
                body: params
            }).then(response => response.json())
                .then(data => {
                    if (data.errors) {
                        const errorMessages = data.errors.map(obj => Object.values(obj.constraints));
                        const formatted = errorMessages.map(row => row.join(",")).join("\n")
                        showModal(formatted);
                    }
                    if (data.success) {
                        showModal(data.message).then(() => {
                            if(window.location.href.includes("listings")){
                                window.location.href = '/listings/'; // Przekierowanie na stronę główną
                            }else if(window.location.href.includes("fleet")){
                                window.location.href = '/fleet/'; // Przekierowanie na stronę główną
                            }
                        })
                    }
                })

        });
    });
});