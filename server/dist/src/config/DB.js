var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from "dotenv";
import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Message from "../models/Message";
import ChatUser from "../models/ChatUser";
import Chat from "../models/Chat";
dotenv.config();
const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    dialect: "postgres",
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    models: [User, Message, ChatUser, Chat],
});
Message.belongsTo(User, { foreignKey: "from", as: "sender" });
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield sequelize.authenticate();
            console.log("Connection has been established successfully.");
            console.log(sequelize.models);
        }
        catch (error) {
            console.error("Unable to connect to the database:", error);
        }
    });
}
export { sequelize, init };
