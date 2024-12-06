var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ChatUser from "../models/ChatUser";
function checkUserChatConnection(userId, chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const checked = yield ChatUser.findOne({
            where: { user_id: userId, chat_id: chatId },
        });
        return !!checked;
    });
}
function findAllBy(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatUsers = yield ChatUser.findAll({
            where: params,
        });
        return chatUsers || [];
    });
}
export { checkUserChatConnection, findAllBy };
