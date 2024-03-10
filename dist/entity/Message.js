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
exports.Message = void 0;
const typeorm_1 = require("typeorm");
let Message = class Message {
};
exports.Message = Message;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30, type: "varchar" }),
    __metadata("design:type", String)
], Message.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30, type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, type: "varchar" }),
    __metadata("design:type", String)
], Message.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, type: "varchar" }),
    __metadata("design:type", String)
], Message.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30, type: "varchar" }),
    __metadata("design:type", String)
], Message.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30, type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "street", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "homeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2000, type: "varchar" }),
    __metadata("design:type", String)
], Message.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer" }),
    __metadata("design:type", Number)
], Message.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, type: "varchar" }),
    __metadata("design:type", String)
], Message.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, type: "varchar" }),
    __metadata("design:type", Number)
], Message.prototype, "portNumber", void 0);
exports.Message = Message = __decorate([
    (0, typeorm_1.Entity)("Messages")
], Message);
