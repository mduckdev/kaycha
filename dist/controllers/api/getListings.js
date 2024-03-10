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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListingsController = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const utils_1 = require("../../utils");
const otomotoData = {
    url: "https://www.otomoto.pl/api/open",
    access_token: null,
    expires: 0
};
const getListingsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const placeholderFile = (yield fs_1.promises.readFile("./placeholder.json")).toString("utf-8");
    const placeholder = JSON.parse(placeholderFile);
    if (!otomotoData.access_token || otomotoData.expires < Date.now()) {
        console.log("Authenticating to otomoto API...");
        const url = otomotoData.url + "/oauth/token";
        const body = new URLSearchParams({
            client_id: process.env.OTOMOTO_CLIENT_ID || "",
            client_secret: process.env.OTOMOTO_CLIENT_SECRET || "",
            grant_type: "password",
            username: process.env.OTOMOTO_USERNAME || "",
            password: process.env.OTOMOTO_PASSWORD || ""
        }).toString();
        const response = yield axios_1.default.post(url, body).catch(err => { console.error(err.response.data); });
        if (((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.access_token) && ((_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.expires_in)) {
            console.log("Successfully authenticated to otomoto API");
            otomotoData.access_token = response.data.access_token;
            otomotoData.expires = Date.now() + (response.data.expires_in * 1000);
        }
        else {
            return res.json(placeholder);
        }
    }
    const url = otomotoData.url + "/account/adverts";
    const config = {
        headers: {
            Authorization: `Bearer ${otomotoData.access_token}`,
            "User-Agent": process.env.OTOMOTO_USERNAME,
            "Content-Type": "application/json"
        }
    };
    const advertsList = yield axios_1.default.get(url, config);
    if (advertsList.data.results.length == 0) {
        console.log(advertsList);
        console.log("No active listings, sending the placeholder");
        return res.json(placeholder);
    }
    const response = [];
    yield advertsList.data.results.forEach((auction) => __awaiter(void 0, void 0, void 0, function* () {
        if (auction.status != "active") {
            return;
        }
        const url = otomotoData.url + `/account/adverts/${auction.id}`;
        const auctionData = yield axios_1.default.get(url, config);
        const temp = {
            title: auctionData.data.title,
            href: auctionData.data.url,
            price: auctionData.data.params.price["1"],
            year: 0,
            src: auctionData.data.photos["1"][(0, utils_1.randomProperty)(auctionData.data.photos["1"])]
        };
        response.push(temp);
    }));
    return res.json(response);
});
exports.getListingsController = getListingsController;
