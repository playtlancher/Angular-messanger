var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Table, Column, Model, ForeignKey, AllowNull, DataType, Default, PrimaryKey, AutoIncrement, } from "sequelize-typescript";
import User from "./User";
import Chat from "./Chat";
let Message = class Message extends Model {
};
__decorate([
    AllowNull(false),
    PrimaryKey,
    AutoIncrement,
    Column(DataType.INTEGER),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    ForeignKey(() => User),
    AllowNull(false),
    Column(DataType.INTEGER),
    __metadata("design:type", Number)
], Message.prototype, "from", void 0);
__decorate([
    ForeignKey(() => Chat),
    AllowNull(false),
    Column(DataType.INTEGER),
    __metadata("design:type", Number)
], Message.prototype, "chat", void 0);
__decorate([
    AllowNull(false),
    Column(DataType.TEXT),
    __metadata("design:type", String)
], Message.prototype, "text", void 0);
__decorate([
    Default(DataType.NOW),
    Column(DataType.DATE),
    __metadata("design:type", Date)
], Message.prototype, "date", void 0);
Message = __decorate([
    Table({
        tableName: "messages",
        timestamps: false,
    })
], Message);
export default Message;
