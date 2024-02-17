let mybutton = document.getElementById("topButton");

window.onscroll = function () { scrollFunction() };

const scrollFunction = () => {
    if (document.body.scrollTop > 30 || document.documentElement.scrollTop > 30) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

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