
const topFunction = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

const scrollToSection = (sectionID) => {
    const section = document.getElementById(sectionID);
    const stickyMenuHeight = document.getElementById('navigation').offsetHeight;

    if (section) {
        const targetScrollPosition = section.offsetTop - stickyMenuHeight - 5;
        window.scrollTo(0, targetScrollPosition);
    }
}
function handleMenuButtonClick() {
    const menuToggle = document.querySelector("input#menu-toggle");
    if (menuToggle.checked) {
        menuToggle.checked = false;
    }
}
const menuButtons = document.querySelectorAll("li.menu-button");
menuButtons.forEach(item=>{
    item.onclick=()=>{
        scrollToSection(item.getAttribute("data"));
        handleMenuButtonClick()
    }
})


