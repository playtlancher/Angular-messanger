var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as MessageRepository from "../repositories/MessageRepository";
import jwt from "jsonwebtoken";
import * as UserRepository from "../repositories/UserRepository";
import * as ChatUserRepository from "../repositories/ChatUserRepository";
import { WebSocket, WebSocketServer } from "ws";
import * as uuid from "uuid";
const clients = new Map();
let wss;
const initWebSocketServer = (server) => {
    wss = new WebSocketServer({ server });
    wss.on("connection", (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
        const id = uuid.v4();
        clients.set(id, ws);
        const chatId = parseInt(req.url.slice(1));
        if (chatId) {
            try {
                console.log(`New client connected: ${id}`);
                const messages = yield MessageRepository.findAllBy({ chat: chatId });
                messages.sort((a, b) => a.date - b.date);
                const event = { type: "Post", payload: { message: messages } };
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(event));
                }
                ws.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () { return yield onMessage(message); }));
                ws.on("close", () => {
                    clients.delete(id);
                    console.log(`Client disconnected: ${id}`);
                });
            }
            catch (error) {
                console.error(`Error handling WebSocket connection for chat ${chatId}:`, error);
                ws.send(JSON.stringify({ error: "Failed to load messages" }));
            }
        }
        else {
            ws.send(JSON.stringify({ error: "Invalid chat ID" }));
            ws.close();
        }
    }));
    return wss;
};
function onMessage(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { type, message } = JSON.parse(data);
        const { token, id, text, chat, from } = message;
        const user = yield validateUser(token);
        if ((yield isUserInChat(user.id, chat)) && user.id === from) {
            let event = { type, payload: {} };
            if (type === "Post") {
                const message = yield MessageRepository.createMessage(text, user.id, chat);
                event.type = "Post";
                event.payload = { message: [message] };
            }
            if (type === "Delete") {
                yield MessageRepository.deleteMessage(id);
                const message = {
                    id,
                    text,
                    chat,
                    from,
                };
                event.type = "Delete";
                event.payload = { message: message };
            }
            if (type === "Update") {
                const message = yield MessageRepository.updateMessage(id, text);
                event.type = "Update";
                event.payload = { message: message };
                console.log(event);
            }
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(event));
                }
            });
        }
    });
}
function validateUser(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const id = decoded.id;
        return yield UserRepository.findOneBy({ id });
    });
}
function isUserInChat(userId, chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ChatUserRepository.checkUserChatConnection(userId, chatId);
    });
}
export { initWebSocketServer };
