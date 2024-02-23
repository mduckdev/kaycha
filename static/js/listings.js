const gallery = document.querySelector('.offer-gallery');
const auctionWidth = document.querySelector('.auction').offsetWidth;
let currentIndex = 0;
const gapPX = 20;
function nextAuction() {
    currentIndex = (currentIndex + 1) % gallery.children.length;
    updateGalleryTransform();
}

function prevAuction() {
    currentIndex = (currentIndex - 1 + gallery.children.length) % gallery.children.length;
    updateGalleryTransform();
}

function updateGalleryTransform() {
    if (currentIndex == 0) {
        gallery.style.transform = `translateX(0px)`;
    } else {
        gallery.style.transform = `translateX(${(-currentIndex * auctionWidth) + gapPX * (gallery.children.length + 2)}px)`;
    }
}



fetch("/api/get-listings", { method: "GET" }).then(x => x.json()).then(response => {
    const offerGallery = document.querySelector(".offer-gallery");
    offerGallery.innerHTML = "";
    response.forEach(item => {
        console.log(item);

        const auctionDiv = document.createElement("div");
        auctionDiv.setAttribute("class", "auction");
        const offerLink = document.createElement("a");
        offerLink.setAttribute("href", item.href)
        offerLink.setAttribute("target", "_blank")

        const image = document.createElement("img");
        image.setAttribute("src", item.imgSrc);
        offerLink.appendChild(image)
        auctionDiv.append(offerLink);
        const title = document.createElement("p");
        title.innerText = `${item.title} ${item.year}`
        auctionDiv.append(title);

        const price = document.createElement("p");
        let priceString = item.price.toLocaleString('pl', {
            style: 'currency',
            currency: 'PLN',
        });
        price.innerText = priceString;
        auctionDiv.append(price);

        offerGallery.appendChild(auctionDiv);
    })

})