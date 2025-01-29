document.getElementById("listingsPreferencesForm")?.addEventListener("submit", function(event){
    event.preventDefault(); 
    const formData = new FormData(event.target);
    const formDataObj = {};
    formData.forEach((value, key) => (formDataObj[key] = value));
    const params = new URLSearchParams(formDataObj);

    fetch("/listings/edit-preferences", {
        method: "POST",
        body: params
    })
    .then(response => response.json())
    .then(data => {
        showModal(data.message).then(()=>{
            window.location="/listings"
        });
    })
    .catch(error => {
        showModal("Wystąpił błąd podczas przetwarzania żądania.","Uwaga").then(()=>{
            console.error('Błąd:', error);
        })
    });
});