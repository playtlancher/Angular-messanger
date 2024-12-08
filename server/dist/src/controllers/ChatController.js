var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import * as ChatUserRepository from "../repositories/ChatUserRepository";
import * as ChatRepository from "../repositories/ChatRepository";
import * as MessageRepository from "../repositories/MessageRepository";
function getUserChats(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = verifyToken(req, res);
        if (!token)
            return;
        try {
            const chatIDs = yield ChatUserRepository.findAllBy({
                user_id: token.id,
            });
            if (!chatIDs || chatIDs.length === 0)
                res.status(404).send("No chats found for this user.");
            const chats = yield Promise.all(chatIDs.map(fetchChat));
            res.status(200).json(chats);
        }
        catch (error) {
            console.error(error);
            res
                .status(500)
                .json({ message: "Internal server error. Please try again later." });
        }
    });
}
function getChatMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatId = Number(req.params.chat_id);
        const token = verifyToken(req, res);
        if (!token)
            return;
        try {
            if (!(yield checkUserAccess(token.id, chatId))) {
                res.status(403).send("User has no access to this chat.");
            }
            const messages = yield fetchMessages(chatId);
            res.status(200).json(messages);
        }
        catch (error) {
            res
                .status(500)
                .json({ message: "Internal server error. Please try again later." });
        }
    });
}
function postMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatId = Number(req.params.chat_id);
        const { message } = req.body;
        if (!(message === null || message === void 0 ? void 0 : message.text))
            res.status(400).send("Invalid message format.");
        const token = verifyToken(req, res);
        if (!token)
            return;
        console.log(token);
        try {
            if (!(yield checkUserAccess(token.id, chatId))) {
                res.status(403).send("User has no access to this chat.");
            }
            const createdMessage = yield MessageRepository.createMessage(message.text, chatId, token.id);
            if (!createdMessage)
                res.status(500).send("Failed to create message.");
            res.status(201).json(createdMessage);
        }
        catch (error) {
            res
                .status(500)
                .json({ message: "Internal server error. Please try again later." });
        }
    });
}
function verifyToken(req, res) {
    try {
        const token = req.cookies.accessToken;
        const secret = process.env.ACCESS_TOKEN_SECRET;
        return jwt.verify(token, secret);
    }
    catch (_a) {
        res.status(403).send("Unauthorized");
        return null;
    }
}
function checkUserAccess(userId, chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield ChatUserRepository.findAllBy({
            user_id: userId,
            chat_id: chatId,
        });
        return result.length > 0;
    });
}
function fetchChat(chat) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield ChatRepository.findOneBy({ id: chat.chat_id });
        if (!result)
            throw new Error(`Chat ID ${chat.chat_id} not found`);
        return result;
    });
}
function fetchMessages(chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const messages = yield MessageRepository.findAllBy({ chat: chatId });
        if (!messages || messages.length === 0)
            throw new Error("No messages found for this chat.");
        return messages.sort((a, b) => a.date.getTime() - b.date.getTime());
    });
}
export { getUserChats, getChatMessages, postMessage };
