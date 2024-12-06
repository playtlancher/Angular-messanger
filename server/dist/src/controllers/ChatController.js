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
        const token = checkToken(req);
        if (!token)
            res.status(403).send("Unauthorized");
        try {
            const chatIDs = yield ChatUserRepository.findAllBy({
                user_id: token === null || token === void 0 ? void 0 : token.user.id,
            });
            if (!chatIDs || chatIDs.length === 0) {
                res.status(404).send("No chats found for this user.");
            }
            const chats = yield Promise.all(chatIDs.map((chat) => __awaiter(this, void 0, void 0, function* () {
                const result = yield ChatRepository.findOneBy({ id: chat.chat_id });
                if (!result) {
                    throw new Error(`Chat ID ${chat.chat_id} not found`);
                }
                return result;
            })));
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
        const token = checkToken(req);
        if (!token)
            res.status(403).send("Unauthorized");
        try {
            const isUserInChat = token && (yield checkUserAccess(token.user.id, chatId));
            if (!isUserInChat) {
                res.status(403).send("User has no access to this chat.");
            }
            const messages = yield MessageRepository.findAllBy({ chat: chatId });
            if (!messages || messages.length === 0) {
                res.status(404).send("No messages found for this chat.");
            }
            messages.sort((a, b) => a.date.getTime() - b.date.getTime());
            res.status(200).json(messages);
        }
        catch (err) {
            console.error(err);
            res.status(500).send("Internal server error. Please try again later.");
        }
    });
}
function postMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatId = Number(req.params.chat_id);
        const { message } = req.body;
        if (!message || !message.text) {
            return res.status(400).send("Invalid message format.");
        }
        const { text } = message;
        const token = checkToken(req);
        if (!token)
            return res.status(403).send("Unauthorized");
        try {
            const isUserInChat = token && (yield checkUserAccess(token.user.id, chatId));
            if (!isUserInChat) {
                return res.status(403).send("User has no access to this chat.");
            }
            const createdMessage = yield MessageRepository.createMessage(text, chatId, token.user.id);
            if (!createdMessage) {
                return res.status(500).send("Failed to create message.");
            }
            return res.status(201).json(createdMessage);
        }
        catch (err) {
            console.error(err);
            return res
                .status(500)
                .send("Internal server error. Please try again later.");
        }
    });
}
function checkToken(req) {
    const token = req.cookies.accessToken;
    if (!token) {
        console.warn("Access token is missing.");
        return;
    }
    try {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) {
            console.error("ACCESS_TOKEN_SECRET is not defined.");
            return;
        }
        return jwt.verify(token, secret);
    }
    catch (err) {
        console.error("Invalid token:", err);
        return;
    }
}
function checkUserAccess(userId, chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield ChatUserRepository.findAllBy({
            user_id: userId,
            chat_id: chatId,
        });
        return result && result.length > 0;
    });
}
export { getUserChats, getChatMessages, postMessage };
