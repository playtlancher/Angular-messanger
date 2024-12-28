import jwt, { JwtPayload } from "jsonwebtoken";
import FileRepository from "../repositories/FileRepository";
import { WebSocket, WebSocketServer } from "ws";
import * as uuid from "uuid";
import path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "path";
import Message from "../models/Message";
import MessageRepository from "../repositories/MessageRepository";
import UserRepository from "../repositories/UserRepository";
import ChatUserRepository from "../repositories/ChatUserRepository";
import ChatService from "./ChatService";
import DecodeJWT from "../utilities/DecodeJWT";
import DecodedToken from "../interfaces/DecodedToken";

type MessageType = "Post" | "Delete" | "Update";

interface ChatMessage {
  id: number;
  text: string;
  date: Date;
  from: number;
  chat: number;
  files: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  data: string;
}

interface WebSocketEvent {
  type: MessageType;
  payload: any;
}

const clients: Map<string, WebSocket> = new Map();
const fileRepository = new FileRepository();
const messageRepository = new MessageRepository();
const chatService = new ChatService();
const userRepository = new UserRepository();
const chatUserRepository = new ChatUserRepository();

export default class WebSocketService {
  private wss: WebSocketServer | undefined;

  initWebSocketServer(server: any): WebSocketServer {
    this.wss = new WebSocketServer({ server });

    this.wss.on("connection", (ws: WebSocket, req: any) => {
      const id = uuid.v4();
      clients.set(id, ws);

      const chatId = this.parseChatId(req.url);
      if (chatId === null) {
        ws.send(JSON.stringify({ error: "Invalid chat ID" }));
        ws.close();
        return;
      }

      this.handleConnection(ws, req.headers.cookie, chatId, id);
    });

    return this.wss;
  }

  private parseChatId(url: string): number | null {
    const chatId = parseInt(url.slice(1));
    return isNaN(chatId) ? null : chatId;
  }

  private async handleConnection(
    ws: WebSocket,
    cookie: string | undefined,
    chatId: number,
    clientId: string,
  ): Promise<void> {
    try {
      const token = this.getCookieValue(cookie, "accessToken");
      if (!token) {
        ws.send(JSON.stringify({ type: "Error", error: "Invalid token" }));
        throw new Error("Authentication token is missing or invalid.");
      }

      const decodedToken = DecodeJWT(token);
      if (!decodedToken) throw new Error("Invalid token.");

      const messages = await this.loadMessages(chatId, decodedToken);
      ws.send(JSON.stringify({ type: "Post", payload: { messages } }));

      ws.on("message", (message: string) => this.onMessage(message));
      ws.on("close", () => this.handleDisconnection(clientId));
    } catch (e) {
      const error = e as Error;
      console.error(`Error during connection for chat ${chatId}:`, error);
      ws.send(JSON.stringify({ error: error.message }));
      ws.close();
    }
  }

  private async loadMessages(chatId: number, decodedToken: DecodedToken) {
    const rawMessages = await chatService.getChatMessages(chatId, decodedToken);

    return Promise.all(
      rawMessages.map(async (message: Message) => ({
        id: message.id,
        text: message.text,
        date: message.date,
        from: message.from,
        chat: message.chat,
        files: await fileRepository.findAllBy({ message_id: message.id }),
      })),
    );
  }

  private async onMessage(data: string): Promise<void> {
    const {
      type,
      message,
      token,
    }: { type: MessageType; message: ChatMessage; token: string } =
      JSON.parse(data);

    try {
      const user = await this.validateUser(token);
      if (!user || !(await this.isUserInChat(user.id, message.chat))) return;

      const event = await this.handleMessageType(type, message, user.id);
      this.broadcast(event);
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  private async handleMessageType(
    type: MessageType,
    message: ChatMessage,
    userId: number,
  ): Promise<WebSocketEvent> {
    switch (type) {
      case "Post":
        return this.handlePostMessage(message, userId);
      case "Delete":
        return this.handleDeleteMessage(message);
      case "Update":
        return this.handleUpdateMessage(message);
      default:
        throw new Error("Unknown message type");
    }
  }

  private async handlePostMessage(
    message: ChatMessage,
    userId: number,
  ): Promise<WebSocketEvent> {
    const newMessage = await messageRepository.createMessage(
      message.text,
      userId,
      message.chat,
    );
    const files = await this.saveFiles(message.files, newMessage!.id);

    return {
      type: "Post",
      payload: {
        messages: [
          {
            ...newMessage,
            files,
          },
        ],
      },
    };
  }

  private async saveFiles(files: UploadedFile[], messageId: number) {
    const uploadsDir = this.getUploadsDir();
    for (let file of files) {
      const fileUUID = uuid.v4();
      const filePath = path.join(uploadsDir, fileUUID);
      const fileData = Buffer.from(file.data.trim(), "base64");

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      await fs.promises.writeFile(filePath, fileData);
      await fileRepository.createFile(fileUUID, messageId, file.name);
    }
  }

  private handleDeleteMessage(message: ChatMessage): WebSocketEvent {
    fileRepository
      .findAllBy({ message_id: message.id })
      .then((files) =>
        files.forEach((file) =>
          fs.unlinkSync(path.join(this.getUploadsDir(), file.id)),
        ),
      )
      .catch(console.error);

    messageRepository.deleteMessage(message.id);

    return { type: "Delete", payload: { message } };
  }

  private async handleUpdateMessage(
    message: ChatMessage,
  ): Promise<WebSocketEvent> {
    const updatedMessage = await messageRepository.updateMessage(
      message.id,
      message.text,
    );
    return { type: "Update", payload: { message: updatedMessage } };
  }

  private broadcast(event: WebSocketEvent): void {
    if (this.wss) {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(event));
        }
      });
    }
  }

  private async validateUser(token: string): Promise<any> {
    const decoded: JwtPayload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as JwtPayload;
    return userRepository.findOneBy({ id: decoded.id });
  }

  private async isUserInChat(userId: number, chatId: number): Promise<boolean> {
    return chatUserRepository.checkUserChatConnection(userId, chatId);
  }

  private getCookieValue(
    cookieString: string | undefined,
    key: string,
  ): string | undefined {
    if (!cookieString) return undefined;
    const cookies = Object.fromEntries(
      cookieString.split("; ").map((cookie) => cookie.split("=")),
    );
    return cookies[key];
  }

  private getUploadsDir(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(dirname(__filename));
    return path.join(__dirname, "uploads");
  }

  private handleDisconnection(clientId: string): void {
    clients.delete(clientId);
    console.log(`Client disconnected: ${clientId}`);
  }
}
