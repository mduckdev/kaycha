function handleMenuButtonClick() {
    alert(1);
    const menuToggle = document.querySelector("input#menu-toggle");
    if (menuToggle.checked) {
        alert(1);
    }
}

const menuButtons = document.querySelectorAll("ul.navigation-buttons li");
menuButtons.forEach(button => {
    button.addEventListener('click', handleMenuButtonClick());
})