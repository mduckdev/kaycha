"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listing = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let Listing = class Listing {
    toResponseObject() {
        const { title, href, price, year, imgSrc } = this;
        return { title, href, price, year, imgSrc };
    }
};
exports.Listing = Listing;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Listing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300, type: "varchar" }),
    (0, class_validator_1.Length)(1, 300, { message: "Tytuł musi zawierać od 1 do 300 znaków" }),
    __metadata("design:type", String)
], Listing.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300, type: "varchar" }),
    (0, class_validator_1.Length)(1, 300, { message: "Adres URL obrazu musi zawierać od 1 do 300 znaków." }),
    (0, class_validator_1.IsUrl)({}, { message: "Adres URL obrazu musi być prawidłowym adresem URL." }),
    __metadata("design:type", String)
], Listing.prototype, "imgSrc", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300, type: "varchar" }),
    (0, class_validator_1.Length)(1, 300, { message: "Adres URL linku musi zawierać od 1 do 300 znaków." }),
    (0, class_validator_1.IsUrl)({}, { message: "Adres URL linku musi być prawidłowym adresem URL." }),
    __metadata("design:type", String)
], Listing.prototype, "href", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    (0, class_validator_1.IsInt)({ message: "Rok musi być liczbą całkowitą." }),
    (0, class_validator_1.Min)(1900, { message: "Rok musi wynosić co najmniej 1900." }),
    (0, class_validator_1.Max)(new Date().getFullYear() + 3, { message: `Rok musi wynosić co najwyżej ${new Date().getFullYear() + 3}.` }),
    __metadata("design:type", Number)
], Listing.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    (0, class_validator_1.IsInt)({ message: "Cena musi być liczbą całkowitą." }),
    (0, class_validator_1.Min)(0, { message: "Cena musi wynosić co najmniej 0." }),
    __metadata("design:type", Number)
], Listing.prototype, "price", void 0);
exports.Listing = Listing = __decorate([
    (0, typeorm_1.Entity)("Listings")
], Listing);
