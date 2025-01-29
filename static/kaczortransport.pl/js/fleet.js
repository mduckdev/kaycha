fetch(`${backendURL}/api/get-fleet`, { method: "GET",mode:"cors" }).then(x => x.json()).then(response => {
    const fleetSection = document.querySelector("section#fleet>div.container");
    fleetSection.innerHTML = ""; // Poprawka: resetowanie zawartości sekcji przed dodaniem danych

    const sectionTitle = document.createElement("h2");
    sectionTitle.innerText = getTranslation("fleet");
    fleetSection.appendChild(sectionTitle);

    response.forEach(item => {
        const sectionBox = document.createElement("div");
        sectionBox.setAttribute("class", "sectionBox");

        const textSection = document.createElement("div");
        textSection.setAttribute("class", "sectionBox-left");

        const title = document.createElement("h3");
        title.innerText = item.model;

        const image = document.createElement("img");
        const imageSection = document.createElement("div");
        imageSection.setAttribute("class", "sectionBox-right");

        image.setAttribute("src", item.imgSrc || "");
        imageSection.appendChild(image);
        // Dodawanie danych z encji pojazdu
        const dataFields = [
            { key: "loadCapacity", unit: "kg" },
            { key: "gvm", unit: "kg" },
            { key: "platformLength", unit: "cm" },
            { key: "flatPartLength", unit: "cm" },
            { key: "slopeLength", unit: "cm" },
            { key: "platformWidth", unit: "cm" },
            { key: "platformHeight", unit: "cm" },
            { key: "loadingSlopeHeight", unit: "cm" },
            { key: "rampLength", unit: "cm" },
            { key: "maxLoadHeight", unit: "cm" },
            { key: "passengerSeats", unit: "" },
            { key: "additionalInfo", unit: "" }
        ];
        
        textSection.appendChild(title);
        dataFields.forEach(field => {
            if(item[field.key] && (item[field.key] !== 0)){
                if(field==="additionalInfo"){
                    const newLines = item[field.key].split("\n");
                    const paragraph = document.createElement("p");
                    paragraph.innerText = `${getTranslation(field.key)}:`;
                    textSection.appendChild(paragraph);
                    newLines.forEach((line)=>{
                        const paragraph = document.createElement("p");
                        paragraph.innerText = line;
                        textSection.appendChild(paragraph);
                    })
                }else{
                    const paragraph = document.createElement("p");
                    paragraph.innerText = `${getTranslation(field.key)}: ${item[field.key]} ${field.unit}`.trim();
                    textSection.appendChild(paragraph);
                }
                
            }
            
        });

        sectionBox.appendChild(textSection);
        sectionBox.appendChild(imageSection);
        fleetSection.appendChild(sectionBox);
    });
});
