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
exports.getFleetController = void 0;
const data_source_1 = require("../../data-source");
const Fleet_1 = require("../../entity/Fleet");
const getFleetController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fleetRepository = (yield data_source_1.AppDataSource).getRepository(Fleet_1.FleetVehicle);
    const fleet = yield fleetRepository.find();
    const obj = fleet.map(e => e.toResponseObject());
    return res.status(200).json(obj);
});
exports.getFleetController = getFleetController;
