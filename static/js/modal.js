// Pobierz modal
const modal = document.getElementById("myModal");

// Pobierz element do zamknięcia modala
const span = document.getElementsByClassName("close")[0];

// Funkcja do pokazania modala z komunikatem
function showModal(message,title="Komunikat") {
  return new Promise((resolve,reject)=>{
    const modalMessage = document.getElementById("modal-message");
    const modalTitle = document.getElementById("modal-title");
  
    modalMessage.innerText = message;
    modalTitle.innerText = title;
  
    modal.style.display = "block";

    // Funkcja do ukrycia modala po kliknięciu na przycisk zamknięcia
    span.onclick = function() {
      modal.style.display = "none";
      resolve()
    }
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
        resolve();
      }
    }
  })
  
}



// Funkcja do ukrycia modala po kliknięciu w dowolne miejsce poza nim
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
