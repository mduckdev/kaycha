function handleMenuButtonClick() {
    const menuToggle = document.querySelector("input#menu-toggle");
    if (menuToggle.checked) {
        menuToggle.checked = false;
    }
}

const menuButtons = document.querySelectorAll("ul.navigation-buttons li");
menuButtons.forEach(button => {
    button.addEventListener('click', handleMenuButtonClick);
})