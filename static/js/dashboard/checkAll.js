 // Skrypt do obsługi zaznaczania wszystkich checkboxów
 const selectAllCheckbox = document.getElementById('selectAll');
 const messageCheckboxes = document.querySelectorAll('.messageCheckbox');

 selectAllCheckbox.addEventListener('change', function () {
     messageCheckboxes.forEach(checkbox => {
         checkbox.checked = this.checked;
     });
 });