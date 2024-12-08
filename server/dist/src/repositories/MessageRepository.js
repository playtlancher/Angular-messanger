var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Message from "../models/Message";
import User from "../models/User";
function createMessage(text, senderId, chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const message = yield Message.create({
                text: text,
                chat: chatId,
                from: senderId,
            });
            return message.toJSON();
        }
        catch (error) {
            console.error(`Error creating message:${error.message}`);
            return null;
        }
    });
}
function findAllBy(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const messages = yield Message.findAll({
            where: params,
            include: [
                {
                    model: User,
                    as: "sender",
                    attributes: ["username"],
                },
            ],
        });
        return messages || [];
    });
}
function findOneBy(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = yield Message.findOne({
            where: params,
            include: [
                {
                    model: User,
                    as: "sender",
                    attributes: ["username"],
                },
            ],
        });
        if (message)
            return message.toJSON();
    });
}
function deleteMessage(messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Message.destroy({
            where: {
                id: messageId,
            },
        });
    });
}
function updateMessage(messageId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = yield Message.findOne({ where: { id: messageId } });
        if (!message)
            return null;
        yield message.update({ text: text });
        return message;
    });
}
export { createMessage, findAllBy, findOneBy, deleteMessage, updateMessage };
