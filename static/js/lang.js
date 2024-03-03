var userLanguage = navigator.language || navigator.userLanguage;

let dict = {};

const languages = {
     "en" : {
        purchase:"PURCHASE",
        sale:"SALE",
        offer:"OFFER",
        services:"SERVICES",
        contact:"CONTACT",
        purchaseOfMachinery:"PURCHASE OF CONSTRUCTION MACHINERY",
        dumpTrucks:"DUMP TRUCKS",
        agriculturalTractors:"AGRICURTULAR TRACTORS",
        trailers:"TRAILERS",
        andMachineAccessories:"AND MACHINE ACCESSORIES",
        allAcross: "ALL ACROSS",
        poland:"POLAND",
        contactWithUs:"Contact with us 502538971",
        ensure:"WE ENSURE",
        quickCompletionTime:"QUICK COMPLETION TIME",
        weOperate247:"WE OPERATE 24/7",
        freeValuation:"FREE VALUATION",
        cashInhand:"CASH IN HAND",
        transportToAnyPlace:"TRANSPORT TO ANY PLACE IN POLAND",
        ourOwnTransport:"OUR OWN TRANSPORTATION AND LOADING",
        purchaseP1:"We will buy back all kinds of construction machinery smaller and larger, older and younger, working and damaged equipment as well as attachments for excavators, loaders, mini-excavators and backhoe loaders, buckets, demolition hammers, drills, compactors, crushers, concrete mixing buckets, buckets, grabs and other types of unusual equipment.",
        purchaseP2:"We pay in cash or by bank transfer, the customer decides, the pick-up of equipment is on our side, we can get to any place in Poland.",
        interestedIn:"WE ARE INTERESTED IN:",
        wheeledAndCrawler:"WHEELED AND CRAWLER EXCAVATORS",
        miniExcavators:"MINI EXCAVATORS",
        backHoeLoaders:"BACKHOE LOADERS",
        loaders:"LOADERS",
        bulldozers:"BULLDOZERS",
        forklifts:"FORKLIFTS",
        basketCranes:"BASKET CRANES",
        saleP1:"In our permanent offer we have all kinds of construction machinery smaller and larger, older and younger, working and damaged equipment, as well as attachments for excavators, loaders, mini-excavators and backhoe loaders, buckets, demolition hammers, drills, compactors, crushers, concrete mixing buckets, buckets, grabs and other types of unusual equipment.",
        saleP2:"Check out the current offer below.",
        currentOffer:"CURRENT OFFER",
        currentOfferP1:"Click on the image to go to the listing on OTOMOTO.pl",
        scrappingOfMachinery:"SCRAPPING OF MACHINERY",
        appraisal:"APPRAISAL",
        servicesP1:"We also offer scrapping and collection with own loading of machinery of various types: construction, agricultural, industrial.",
        servicesP2:"Complicated loading of large and heavy machinery is not a problem for us. If you have damaged equipment in the yard then we can send our transport and arrange loading in our scope without wasting your time.",
        servicesP3:"Our offer also includes an appraisal service. We can perform the service of inspecting the machine at the customer's request before purchase.",
        servicesP4:"Upon request, we can prepare a condition report and a valuation of the machine.",
        firstName:"First name:",
        lastName:"Last name:",
        email:"E-mail address:",
        city:"City:",
        street:"Street:",
        houseApartmentNumber:"House/apartment number:",
        companyHeadquarters:"COMPANY HEADQUARTERS:",
        message:"Message:",
        policyConsent:"I consent to the processing of my personal data in compliance with the",
        policyConsentLink:"PRIVACY POLICY",
        send:"SEND",
        privacyPolicy:"PRIVACY POLICY",
    },
    "pl":{
        purchase:"SKUP",
        sale:"SPRZEDAŻ",
        offer:"OFERTA",
        services:"USŁUGI",
        contact:"KONTAKT",
        purchaseOfMachinery:"SKUP MASZYN BUDOWLANYCH",
        dumpTrucks:"WYWROTEK",
        agriculturalTractors:"CIĄGNIKÓW ROLNICZYCH",
        trailers:"PRZYCZEP",
        andMachineAccessories:"ORAZ OSPRZĘTU DO MASZYN",
        allAcross: "NA TERENIE",
        poland:"CAŁEJ POLSKI",
        contactWithUs:"SKONTAKTUJ SIĘ Z NAMI 502538971",
        ensure:"ZAPEWNIAMY",
        quickCompletionTime:"SZYBKI CZAS REALIZACJI",
        weOperate247:"DZIAŁAMY 24/7",
        freeValuation:"DARMOWA WYCENA",
        cashInhand:"GOTÓWKA DO RĘKI",
        transportToAnyPlace:"DOJAZD W KAŻDE MIEJSCE W POLSCE",
        ourOwnTransport:"DOJAZD W KAŻDE MIEJSCE W POLSCE",
        purchaseP1:"Odkupimy wszelkiego rodzaju maszyny budowlane mniejsze oraz większe, starsze i młodsze, sprzęt sprawny i uszkodzony jak również osprzęt do koparek, ładowarek, minikoparek i koparko ładowarek, łyżki, młoty wyburzeniowe, wiertnice, zagęszczarki, kruszarki, łyżki mieszające do betonu, czerpaki, chwytaki i inne rodzaje nietypowego osprzętu. ",
        purchaseP2:"Płacimy gotówką lub przelewem, decyduje klient, odbiór sprzętu po naszej stronie, dojeżdżamy w każde miejsce w Polsce. ",
        interestedIn:"INTERESUJĄ NAS:",
        wheeledAndCrawler:"KOPARKI KOŁOWE I GĄSIENICOWE",
        miniExcavators:"MINIKOPARKI",
        backHoeLoaders:"KOPARKO-ŁADOWARKI",
        loaders:"ŁADOWARKI",
        bulldozers:"SPYCHARKI",
        forklifts:"WÓZKI WIDŁOWE",
        basketCranes:"PODNOŚNIKI KOSZOWE",
        saleP1:"W stałej ofercie posiadamy wszelkiego rodzaju maszyny budowlane mniejsze oraz większe, starsze i młodsze, sprzęt sprawny i uszkodzony jak również osprzęt do koparek, ładowarek, minikoparek i koparko ładowarek, łyżki, młoty wyburzeniowe, wiertnice, zagęszczarki, kruszarki, łyżki mieszające do betonu, czerpaki, chwytaki i inne rodzaje nietypowego osprzętu.",
        saleP2:"Sprawdź poniżej aktuaną ofertę.",
        currentOffer:"AKTUALNA OFERTA",
        currentOfferP1:"Kliknij obraz, aby przejść do ogłoszenia na OTOMOTO.pl",
        scrappingOfMachinery:"ZŁOMOWANIE MASZYN",
        appraisal:"RZECZOZNASTWO",
        servicesP1:"Oferujemy również złomowanie i odbiór z własnym załadunkiem maszyn różnego rodzaju: budowlanych, rolniczych, przemysłowych.",
        servicesP2:"Skomplikowany załadunek dużych i ciężkich maszyn nie stanowi dla nas problemu. Jeśli posiadasz na placu uszkodzony sprzęt to możemy wysłać nasz transport i zorganizować załadunek w naszym zakresie bez marnowania Twojego czasu.",
        servicesP3:"W naszej ofercie znajduje się także usługa rzeczoznawstwa. Możemy wykonać usługę oględzin maszyny na zlecenie klienta przed zakupem.",
        servicesP4:"Na życzenie możemy sporządzić raport stanu technicznego oraz wycenę maszyny.",
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
    }
}

dict=languages["pl"];

Object.keys(languages).forEach(language=>{
    if(userLanguage.startsWith(language)){
        dict=languages[language];
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