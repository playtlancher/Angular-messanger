import * as MessageRepository from "../repositories/MessageRepository";
import jwt from "jsonwebtoken";
import * as UserRepository from "../repositories/UserRepository";
import * as ChatUserRepository from "../repositories/ChatUserRepository";
import { WebSocket, WebSocketServer } from "ws";
import * as uuid from "uuid";

const clients: Map<string, WebSocket> = new Map();

let wss: WebSocketServer;

const initWebSocketServer = (server: any): WebSocketServer => {
  wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket, req: any) => {
    const id = uuid.v4();
    clients.set(id, ws);

    const chatId = parseInt(req.url.slice(1));
    if (chatId) {
      try {
        console.log(`New client connected: ${id}`);

        const messages = await MessageRepository.findAllBy({ chat: chatId });
        messages.sort((a: any, b: any) => a.date - b.date);
        ws.send(JSON.stringify(messages));

        ws.on("message", async (message: string) => await onMessage(message));
        ws.on("close", () => {
          clients.delete(id);
          console.log(`Client disconnected: ${id}`);
        });
      } catch (error) {
        console.error(
          `Error handling WebSocket connection for chat ${chatId}:`,
          error,
        );
        ws.send(JSON.stringify({ error: "Failed to load messages" }));
      }
    } else {
      ws.send(JSON.stringify({ error: "Invalid chat ID" }));
      ws.close();
    }
  });

  return wss;
};

async function onMessage(message: string): Promise<void> {
  const data = JSON.parse(message);
  const { token, text, chat } = data;
  const user = await validateUser(token);
  if (await isUserInChat(user.id, chat)) {
    const newMessage = await MessageRepository.createMessage(
      user.id,
      chat,
      text,
    );
    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify([newMessage]));
      }
    });
  }
}

async function validateUser(token: string): Promise<any | null> {
  const decoded: any = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
  );
  const id = decoded.user.id;
  return await UserRepository.findOneBy({ id });
}

async function isUserInChat(userId: number, chatId: number): Promise<boolean> {
  return await ChatUserRepository.checkUserChatConnection(userId, chatId);
}

export { initWebSocketServer };
