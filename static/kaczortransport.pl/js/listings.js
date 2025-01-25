const gallery = document.querySelector('.offer-gallery');
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
const nextButton = document.querySelector("img.next-btn");
nextButton.onclick = nextAuction;
const prevButton = document.querySelector("img.prev-btn");
prevButton.onclick = prevAuction;


function updateGalleryTransform() {
    const auctionWidth = document.querySelector('.auction').offsetWidth;
    if (currentIndex == 0) {
        gallery.style.transform = `translateX(0px)`;
    } else {
        const offset = (-currentIndex * (auctionWidth + gapPX));
        console.log(currentIndex, auctionWidth, offset);
        gallery.style.transform = `translateX(${offset}px)`;
    }
}



fetch("/api/get-listings", { method: "GET" }).then(x => x.json()).then(response => {
    const offerGallery = document.querySelector(".offer-gallery");
    offerGallery.innerHTML = "";
    response.forEach(item => {
        const auctionDiv = document.createElement("div");
        auctionDiv.setAttribute("class", "auction");
        const offerLink = document.createElement("a");
        offerLink.setAttribute("href", item.href || "")
        offerLink.setAttribute("target", "_blank")

        const image = document.createElement("img");
        image.setAttribute("src", item.imgSrc || "");
        offerLink.appendChild(image)
        auctionDiv.append(offerLink);
        const title = document.createElement("p");
        title.innerText = `${item.title || ""} ${item.year || ""}`
        auctionDiv.append(title);

        const price = document.createElement("p");
        let priceString = item.price?.toLocaleString('pl', {
            style: 'currency',
            currency: 'PLN',
        }) || "";
        price.innerText = priceString;
        auctionDiv.append(price);

        offerGallery.appendChild(auctionDiv);
    })

})