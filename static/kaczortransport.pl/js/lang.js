var userLanguage = navigator.language || navigator.userLanguage;
document.documentElement.lang = userLanguage;
let dict = {};
const languages = {
    "en": {
       services: "SERVICES",
       roadsideAssistance: "ROADSIDE ASSISTANCE",
       fleet: "FLEET",
       contact: "CONTACT",
       contactWithUs: "CONTACT US",
       fastDelivery: "FAST DELIVERY",
       weOperate247: "WE OPERATE 24/7",
       freeValuation: "FREE VALUATION",
       atrractivePrices: "ATTRACTIVE PRICES",
       weCoverWholeCountry: "WE COVER THE WHOLE COUNTRY",
       specialisedFleet: "SPECIALISED FLEET",
       weOfferTransport: "WE OFFER TRANSPORT:",
       agriculturalMachinery: "AGRICULTURAL MACHINERY",
       constructionMachinery: "CONSTRUCTION MACHINERY",
       industrialMachineryAndEquipment: "INDUSTRIAL MACHINERY AND EQUIPMENT",
       forklifts: "FORKLIFTS",
       trailers: "TRAILERS",
       vehicles: "VEHICLES",
       allKindsOfGoods: "ALL KINDS OF GOODS",
       palletsAndNonStandardLoads: "PALLETS AND NON-STANDARD LOADS",
       ocpLicense: "OCP LICENSE",
       vatInvoice: "VAT INVOICE",
       weOfferRoadsideAssistanceService: "WE OFFER ROADSIDE ASSISTANCE SERVICES",
       weProvide: "WE PROVIDE:",
       arrivalAtScene: "ARRIVAL AT THE SCENE",
       loadingDamagedVehicle: "LOADING DAMAGED VEHICLE",
       transportToDesignatedPlace: "TRANSPORT TO DESIGNATED PLACE",
       vehicleStorageAtParking: "VEHICLE STORAGE AT PARKING",
       loadCapacity: "PAYLOAD",
       gvm: "gvm",
       platformLength: "RAMP DIMENSIONS",
       length: "LENGTH",
       flatPartLength: "FLAT PART LENGTH",
       slopeLength: "SLOPE LENGTH",
       platformWidth: "WIDTH",
       platformHeight: "HEIGHT (LEVELED FOR DRIVING)",
       loadingSlopeHeight: "LOADING SLOPE HEIGHT",
       rampLength: "RAMP LENGTH",
       maxLoadHeight: "MAXIMUM LOAD HEIGHT",
       passengerSeats: "NUMBER OF PASSENGER SEATS",
       firstName: "First Name:",
       lastName: "Last Name:",
       email: "Email Address:",
       city: "City:",
       street: "Street:",
       houseApartmentNumber: "House/Apartment Number:",
       message: "Message Content:",
       policyConsent: "I consent to the processing of my personal data in accordance with the ",
       policyConsentLink: "Privacy Policy",
       send: "SEND",
       companyHeadquarters: "COMPANY HEADQUARTERS:",
       privacyPolicy: "PRIVACY POLICY",
       loadingAddress:"Loading address:",
       unloadingAddress:"Unloading address:",
       model:"Model"
   },
   "pl":{
       services:"USŁUGI",
       roadsideAssistance:"POMOC DROGOWA",
       fleet:"FLOTA",
       contact:"KONTAKT",
       contactWithUs:"SKONTAKTUJ SIĘ Z NAMI",
       fastDelivery:"SZYBKI CZAS REALIZACJI",
       weOperate247:"DZIAŁAMY 24/7",
       freeValuation:"DARMOWA WYCENA",
       atrractivePrices:"ATRAKCYJNE CENY",
       weCoverWholeCountry:"OBSŁUGUJEMY CAŁY KRAJ",
       specialisedFleet:"SPECJALISTYCZNA FLOTA",
       weOfferTransport:"OFERUJEMY TRANSPORT:",
       agriculturalMachinery:"MASZYN ROLNICZYCH",
       constructionMachinery:"MASZYN BUDOWLANYCH",
       industrialMachineryAndEquipment:"MASZYN I URZĄDZEŃ PRZEMYSŁOWYCH",
       forklifts:"WÓZKÓW WIDŁOWYCH",
       trailers:"PRZYCZEP",
       vehicles:"POJAZDÓW",
       allKindsOfGoods:"WSZELKIEGO RODZAJU TOWARÓW",
       palletsAndNonStandardLoads:"PALET I ŁADUNKÓW NIESTANDARDOWYCH",
       ocpLicense:"LICENCJA OCP",
       vatInvoice:"FAKTURA VAT",
       weOfferRoadsideAssistanceService:"ŚWIADCZYMY USŁUGI POMOCY DROGOWEJ",
       weProvide:"ZAPEWNIAMY:",
       arrivalAtScene: "DOJAZD NA MIEJSCE ZDARZENIA",
       loadingDamagedVehicle: "ZAŁADUNEK USZKODZONEGO POJAZDU",
       transportToDesignatedPlace: "TRANSPORT W WYZNACZONE MIEJSCE",
       vehicleStorageAtParking: "PRZECHOWANIE POJAZDU NA PARKINGU",
       loadCapacity: "ŁADOWNOŚĆ",
       gvm: "DMC",
       platformLength: "WYMIARY NAJAZDU",
       length: "DŁUGOŚĆ",
       flatPartLength: "CZĘŚĆ PŁASKA",
       slopeLength: "SKOS",
       platformWidth: "SZEROKOŚĆ",
       platformHeight: "WYSOKOŚĆ (WYPOZIOMOWANA DO JAZDY)",
       loadingSlopeHeight: "WYSOKOŚĆ SKOSU DO ZAŁADUNKU",
       rampLength: "DŁUGOŚĆ NAJAZDÓW",
       maxLoadHeight: "MAKSYMALNA WYSOKOŚĆ ŁADUNKU",
       passengerSeats: "LICZBA MIEJSC PASAŻERA",
       firstName:"Imię:",
       lastName:"Nazwisko:",
       email:"Adres e-mail:",
       city:"Miejscowość:",
       street:"Ulica:",
       houseApartmentNumber:"Nr domu/mieszkania:",
       message:"Treść wiadomości:",
       policyConsent:"Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z ",
       policyConsentLink:"Polityką Prywatności",
       send:"WYŚLIJ",
       companyHeadquarters:"SIEDZIBA FIRMY:",
       privacyPolicy:"POLITYKA PRYWATNOŚCI",
       loadingAddress:"Adres załadunku:",
       unloadingAddress:"Adres rozładunku:",
       model:"Model"
   }
}

dict=languages["pl"];

Object.keys(languages).forEach(language=>{
    if(userLanguage.startsWith(language)){
        dict=languages[language];
        document.documentElement.lang=language;
    }
})

const elements = document.querySelectorAll("[dict]");
elements.forEach(element=>{
    let key = element.getAttribute('dict');
    let translation = dict[key];
    if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
        // Jeśli element to input, zmień wartość atrybutu placeholder
        element.placeholder = translation;
    } else {
        // W przeciwnym razie zmień zawartość tekstową
        element.innerText=translation;
    }
})
const getTranslation = (key)=>{
    return dict[key];
}