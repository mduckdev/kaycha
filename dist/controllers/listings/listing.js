"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listing = void 0;
const data_source_1 = require("../../data-source");
const Listing_1 = require("../../entity/Listing");
const class_validator_1 = require("class-validator");
const ListingsPreferences_1 = require("../../entity/ListingsPreferences");
class listing {
    getIndex(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const listingRepository = (yield data_source_1.AppDataSource).getRepository(Listing_1.Listing);
            const listings = yield listingRepository.find();
            const prefRepository = (yield data_source_1.AppDataSource).getRepository(ListingsPreferences_1.ListingsPreferences);
            const preferences = yield prefRepository.findOne({ where: { id: 1 } });
            res.render('listings/index', { listings, preferences, user: req.session.user, csrfToken: req.session.csrfToken });
        });
    }
    getAdd(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.render('listings/add', { user: req.session.user, csrfToken: req.session.csrfToken });
        });
    }
    getEdit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const listingRepository = (yield data_source_1.AppDataSource).getRepository(Listing_1.Listing);
            const id = Number(req.params.id);
            const listing = yield listingRepository.findOneBy({ id: id });
            res.render('listings/edit', { listing, user: req.session.user, csrfToken: req.session.csrfToken });
        });
    }
    put(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const listingRepository = (yield data_source_1.AppDataSource).getRepository(Listing_1.Listing);
            const newListing = new Listing_1.Listing();
            newListing.title = req.body.title;
            newListing.imgSrc = req.body.imgSrc;
            newListing.href = req.body.href;
            newListing.year = Number(req.body.year);
            newListing.price = Number(req.body.price);
            const errors = yield (0, class_validator_1.validate)(newListing);
            if (errors.length > 0) {
                res.status(400).json({ errors });
                return;
            }
            yield listingRepository.save(newListing);
            res.json({ success: true, message: "Dodano nowe ogłoszenie" });
        });
    }
    patch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const listingRepository = (yield data_source_1.AppDataSource).getRepository(Listing_1.Listing);
            let listingToUpdate = yield listingRepository.findOneBy({ id: Number(req.params.id) });
            if (listingToUpdate) {
                listingToUpdate.title = req.body.title;
                listingToUpdate.imgSrc = req.body.imgSrc;
                listingToUpdate.href = req.body.href;
                listingToUpdate.year = Number(req.body.year);
                listingToUpdate.price = Number(req.body.price);
                const errors = yield (0, class_validator_1.validate)(listingToUpdate);
                if (errors.length > 0) {
                    res.status(400).json({ errors });
                    return;
                }
                yield listingRepository.save(listingToUpdate);
            }
            res.json({ success: true, message: "Pomyślnie zaktualizowano ogłoszenie" });
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const listingRepository = (yield data_source_1.AppDataSource).getRepository(Listing_1.Listing);
            const result = yield listingRepository.delete(Number(req.params.id));
            if (result.affected === 1) {
                res.status(200).json({ success: true, message: 'Pomyślnie usunięto ogłoszenie.' });
            }
            else {
                res.status(404).json({ success: false, message: 'Nie znaleziono ogłoszenia o podanym ID do usunięcia.' });
            }
        });
    }
    editPreferences(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { showDashboard, showOtomoto } = req.body;
                const prefRepository = (yield data_source_1.AppDataSource).getRepository(ListingsPreferences_1.ListingsPreferences);
                const preferences = yield prefRepository.findOne({ where: { id: 1 } });
                if (!preferences) {
                    res.status(404).json({ success: false, message: "Brak ustawień w bazie" });
                    return;
                }
                const newShowDashboard = showDashboard === "yes" ? true : false;
                const newShowOtomoto = showOtomoto === "yes" ? true : false;
                if (preferences.showDashboard === newShowDashboard &&
                    preferences.showOtomoto === newShowOtomoto) {
                    res.status(200).json({ success: true, message: "Brak zmian" });
                    return;
                }
                preferences.showDashboard = newShowDashboard;
                preferences.showOtomoto = newShowOtomoto;
                yield prefRepository.save(preferences);
                res.status(200).json({ success: true, message: "Preferencje zaktualizowane" });
            }
            catch (error) {
                console.error("Błąd podczas edycji preferencji:", error);
                res.status(500).json({ success: false, message: "Wewnętrzny błąd serwera" });
            }
        });
    }
}
exports.listing = listing;
