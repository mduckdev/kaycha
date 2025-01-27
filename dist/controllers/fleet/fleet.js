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
exports.Fleet = void 0;
const data_source_1 = require("../../data-source");
const class_validator_1 = require("class-validator");
const Fleet_1 = require("../../entity/Fleet");
class Fleet {
    getIndex(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fleetRepository = (yield data_source_1.AppDataSource).getRepository(Fleet_1.FleetVehicle);
            const fleet = yield fleetRepository.find();
            res.render('fleet/index', { vehicles: fleet, user: req.session.user, csrfToken: req.session.csrfToken });
        });
    }
    getAdd(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.render('fleet/add', { user: req.session.user, csrfToken: req.session.csrfToken });
        });
    }
    getEdit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fleetRepository = (yield data_source_1.AppDataSource).getRepository(Fleet_1.FleetVehicle);
            const id = Number(req.params.id);
            const vehicle = yield fleetRepository.findOneBy({ id: id });
            if (vehicle) {
                res.render('fleet/edit', { vehicle, user: req.session.user, csrfToken: req.session.csrfToken });
            }
            else {
                res.status(400).send("Nieprawidłowe ID");
            }
        });
    }
    put(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fleetRepository = (yield data_source_1.AppDataSource).getRepository(Fleet_1.FleetVehicle);
            const newVehicle = new Fleet_1.FleetVehicle();
            newVehicle.model = String(req.body.model);
            newVehicle.loadCapacity = Number(req.body.loadCapacity);
            newVehicle.gvm = Number(req.body.gvm);
            newVehicle.platformLength = Number(req.body.platformLength);
            newVehicle.flatPartLength = Number(req.body.flatPartLength);
            newVehicle.slopeLength = Number(req.body.slopeLength);
            newVehicle.platformWidth = Number(req.body.platformWidth);
            newVehicle.platformHeight = Number(req.body.platformHeight);
            newVehicle.loadingSlopeHeight = Number(req.body.loadingSlopeHeight);
            newVehicle.rampLength = Number(req.body.rampLength);
            newVehicle.maxLoadHeight = Number(req.body.maxLoadHeight);
            newVehicle.passengerSeats = Number(req.body.passengerSeats);
            newVehicle.imgSrc = String(req.body.imgSrc);
            const errors = yield (0, class_validator_1.validate)(newVehicle);
            if (errors.length > 0) {
                res.status(400).json({ errors });
                return;
            }
            yield fleetRepository.save(newVehicle);
            res.json({ success: true, message: "Dodano nowe ogłoszenie" });
        });
    }
    patch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fleetRepository = (yield data_source_1.AppDataSource).getRepository(Fleet_1.FleetVehicle);
            let vehicleToUpdate = yield fleetRepository.findOneBy({ id: Number(req.params.id) });
            if (vehicleToUpdate) {
                vehicleToUpdate.model = String(req.body.model);
                vehicleToUpdate.loadCapacity = Number(req.body.loadCapacity);
                vehicleToUpdate.gvm = Number(req.body.gvm);
                vehicleToUpdate.platformLength = Number(req.body.platformLength);
                vehicleToUpdate.flatPartLength = Number(req.body.flatPartLength);
                vehicleToUpdate.slopeLength = Number(req.body.slopeLength);
                vehicleToUpdate.platformWidth = Number(req.body.platformWidth);
                vehicleToUpdate.platformHeight = Number(req.body.platformHeight);
                vehicleToUpdate.loadingSlopeHeight = Number(req.body.loadingSlopeHeight);
                vehicleToUpdate.rampLength = Number(req.body.rampLength);
                vehicleToUpdate.maxLoadHeight = Number(req.body.maxLoadHeight);
                vehicleToUpdate.passengerSeats = Number(req.body.passengerSeats);
                vehicleToUpdate.imgSrc = String(req.body.imgSrc);
                const errors = yield (0, class_validator_1.validate)(vehicleToUpdate);
                if (errors.length > 0) {
                    res.status(400).json({ errors });
                    return;
                }
                yield fleetRepository.save(vehicleToUpdate);
                res.json({ success: true, message: "Pomyślnie zaktualizowano pojazd" });
            }
            else {
                res.json({ success: false, message: "Nie znaleziono pojazdu z podanym id" });
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fleetRepository = (yield data_source_1.AppDataSource).getRepository(Fleet_1.FleetVehicle);
            const result = yield fleetRepository.delete(Number(req.params.id));
            if (result.affected === 1) {
                res.status(200).json({ success: true, message: 'Pomyślnie usunięto pojazd.' });
            }
            else {
                res.status(404).json({ success: false, message: 'Nie znaleziono pojazdu o podanym ID do usunięcia.' });
            }
        });
    }
}
exports.Fleet = Fleet;
