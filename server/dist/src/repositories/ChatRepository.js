var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Chat from "../models/Chat";
function createChat(name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const chat = yield Chat.create({
                name,
            });
            return chat.toJSON();
        }
        catch (err) {
            console.log(err.message);
            return null;
        }
    });
}
function findAllBy(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Chat.findAll({
            where: params,
        });
    });
}
function findOneBy(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Chat.findOne({
            where: params,
        });
    });
}
export { createChat, findAllBy, findOneBy };
