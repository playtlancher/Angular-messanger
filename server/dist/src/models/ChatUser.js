var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Table, Column, Model, ForeignKey, PrimaryKey, AllowNull, AutoIncrement, DataType, } from "sequelize-typescript";
import User from "./User";
import Chat from "./Chat";
let ChatUser = class ChatUser extends Model {
};
__decorate([
    PrimaryKey,
    AutoIncrement,
    AllowNull(false),
    Column(DataType.INTEGER),
    __metadata("design:type", Number)
], ChatUser.prototype, "id", void 0);
__decorate([
    ForeignKey(() => User),
    Column(DataType.INTEGER),
    __metadata("design:type", Number)
], ChatUser.prototype, "user_id", void 0);
__decorate([
    ForeignKey(() => Chat),
    Column(DataType.INTEGER),
    __metadata("design:type", Number)
], ChatUser.prototype, "chat_id", void 0);
ChatUser = __decorate([
    Table({
        tableName: "chat_users",
        timestamps: false,
    })
], ChatUser);
export default ChatUser;
