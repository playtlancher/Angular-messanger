import * as MessageRepository from "../repositories/MessageRepository";
import jwt from "jsonwebtoken";
import * as UserRepository from "../repositories/UserRepository";
import * as ChatUserRepository from "../repositories/ChatUserRepository";
import FileRepository from "../repositories/FileRepository";
import { WebSocket, WebSocketServer } from "ws";
import * as uuid from "uuid";
import path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "path";
import Message from "../models/Message";

const clients: Map<string, WebSocket> = new Map();
const fileRepository = new FileRepository();

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

        const messageFile = await Promise.all(
          messages.map(async (message: Message) => {
            return {
              id: message.id,
              text: message.text,
              date: message.date,
              from: message.from,
              chat: message.chat,
              files: await fileRepository.findAllBy({ message_id: message.id }),
            };
          }),
        );

        const event = { type: "Post", payload: { messages: messageFile } };
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(event));
        }
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

async function onMessage(data: string): Promise<void> {
  const { type, message, token } = JSON.parse(data);
  const { id, text, chat, from, files } = message;

  // try {
  const user = await validateUser(token);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(dirname(__filename));
  const uploadsDir = path.join(__dirname, "uploads");

  if ((await isUserInChat(user.id, chat)) && user.id === from) {
    let event = { type, payload: {} };

    if (type === "Post") {
      const newMessage = await MessageRepository.createMessage(
        text,
        user.id,
        chat,
      );

      let attachedFiles: Array<{ id: string; name: string }> = [];

      if (files && files.length > 0) {
        for (let file of files) {
          const fileName = file.name;

          if (typeof file.data !== "string") {
            throw new Error(`Invalid file data format for ${fileName}`);
          }

          const cleanBase64 = file.data.trim();
          const fileData = Buffer.from(cleanBase64, "base64");
          const fileUUID = uuid.v4();
          const filePath = path.join(uploadsDir, fileUUID);

          const createdFile = await fileRepository.createFile(
            fileUUID,
            newMessage!.id,
            fileName,
          );

          attachedFiles.push({
            id: createdFile!.id,
            name: fileName,
          });

          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          await fs.promises.writeFile(filePath, fileData);
        }
      }

      event.type = "Post";
      event.payload = {
        messages: [
          {
            id: newMessage!.id,
            text: newMessage!.text,
            date: newMessage!.date,
            from: newMessage!.from,
            files: attachedFiles,
          },
        ],
      };
    }

    if (type === "Delete") {
      if (from === user.id) {
        await MessageRepository.deleteMessage(id);
        const messageToDelete = { id, text, chat, from };
        event.type = "Delete";
        event.payload = { message: messageToDelete };
      }
    }

    if (type === "Update") {
      if (from === user.id) {
        const updatedMessage = await MessageRepository.updateMessage(id, text);
        event.type = "Update";
        event.payload = { message: updatedMessage };
      }
    }

    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(event));
      }
    });
  }
  // } catch (error) {
  //   console.error("Error handling message:", error);
  // }
}

async function validateUser(token: string): Promise<any | null> {
  const decoded: any = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
  );
  const id = decoded.id;
  return await UserRepository.findOneBy({ id });
}

async function isUserInChat(userId: number, chatId: number): Promise<boolean> {
  return await ChatUserRepository.checkUserChatConnection(userId, chatId);
}

export { initWebSocketServer };
