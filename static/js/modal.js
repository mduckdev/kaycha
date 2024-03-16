// Pobierz modal
const modal = document.getElementById("myModal");

// Pobierz element do zamknięcia modala
const span = document.querySelector("span.close");

const modalButtons = document.getElementById("modal-buttons")

// Funkcja do pokazania modala z komunikatem
//resolves with true when clicked outside or on close button
const showModal = (message,title="Komunikat") =>{
  return new Promise((resolve,reject)=>{
    const modalMessage = document.getElementById("modal-message");
    const modalTitle = document.getElementById("modal-title");
  
    modalMessage.innerText = message;
    modalTitle.innerText = title;
  
    modal.style.display = "block";
    modalButtons.style.display="none"

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
//resolves with true only when clicked confirmation button, otherwise rejects with false
const showConfirmModal = (message,title="Komunikat",button01Text="OK",button02Text="Anuluj")=>{
  return new Promise((resolve,reject)=>{
    const modalMessage = document.getElementById("modal-message");
    const modalTitle = document.getElementById("modal-title");
    const button01 = document.getElementById("modal-button-1");
    const button02 = document.getElementById("modal-button-2");

    modalMessage.innerText = message;
    modalTitle.innerText = title;
    button01.innerText = button01Text;
    button02.innerText = button02Text;

  
    modal.style.display = "block";
    modalButtons.style.display = "block";


    button01.onclick = ()=>{
      modal.style.display = "none";
      resolve(true);
    }

    button02.onclick = ()=>{
      modal.style.display = "none";
      reject(false);
    }

    // Funkcja do ukrycia modala po kliknięciu na przycisk zamknięcia
    span.onclick = ()=>{
      modal.style.display = "none";
      reject(false);
    }
    window.onclick = (event)=> {
      if (event.target == modal) {
        modal.style.display = "none";
        reject(false);
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
