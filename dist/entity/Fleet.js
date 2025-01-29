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
exports.FleetVehicle = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let FleetVehicle = class FleetVehicle {
    toResponseObject() {
        const { id, model, loadCapacity, gvm, platformLength, flatPartLength, slopeLength, platformWidth, platformHeight, loadingSlopeHeight, rampLength, maxLoadHeight, passengerSeats, imgSrc, additionalInfo } = this;
        return {
            id,
            model,
            loadCapacity,
            gvm,
            platformLength,
            flatPartLength,
            slopeLength,
            platformWidth,
            platformHeight,
            loadingSlopeHeight,
            rampLength,
            maxLoadHeight,
            passengerSeats,
            imgSrc,
            additionalInfo
        };
    }
};
exports.FleetVehicle = FleetVehicle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], FleetVehicle.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "loadCapacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "gvm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "platformLength", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "flatPartLength", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "slopeLength", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "platformWidth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "platformHeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "loadingSlopeHeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "rampLength", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "maxLoadHeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], FleetVehicle.prototype, "passengerSeats", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 300, nullable: true }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.MinLength)(0),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], FleetVehicle.prototype, "imgSrc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    (0, class_validator_1.MinLength)(0),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], FleetVehicle.prototype, "additionalInfo", void 0);
exports.FleetVehicle = FleetVehicle = __decorate([
    (0, typeorm_1.Entity)("Fleet")
], FleetVehicle);
