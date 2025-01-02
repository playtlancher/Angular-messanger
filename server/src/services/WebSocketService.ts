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
import DecodeJWT from "../Utils/DecodeJWT";
import DecodedToken from "../interfaces/DecodedToken";
import Logger from "../Utils/Logger";
import MessageService from "./MessageService";

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
const messageService = new MessageService();
const chatService = new ChatService();
const userRepository = new UserRepository();
const chatUserRepository = new ChatUserRepository();

export default class WebSocketService {
  private wss: WebSocketServer | undefined;

  initWebSocketServer(server: any): WebSocketServer {
    this.wss = new WebSocketServer({ server });

    this.wss.on("connection", (ws: WebSocket, req: any) => {
      const urlParams = new URLSearchParams(req.url.split("?")[1]);
      const chatId = parseInt(urlParams.get("chatId") || "");
      const jwtToken = urlParams.get("jwtToken");
      if (!jwtToken) return;
      const id: string = String(DecodeJWT(jwtToken).id);
      clients.set(id, ws);
      if (isNaN(chatId) || !jwtToken) {
        ws.send(JSON.stringify({ error: "Invalid chat ID or missing JWT token" }));
        ws.close();
        return;
      }
      Logger.info("Trying handle connection");
      this.handleConnection(ws, jwtToken, chatId, id);
    });

    return this.wss;
  }

  private async handleConnection(ws: WebSocket, token: string | undefined, chatId: number, clientId: string): Promise<void> {
    try {
      if (!token) {
        ws.send(JSON.stringify({ type: "Error", error: "Invalid token" }));
        Logger.error("Authentication token is missing or invalid.");
        return;
      }

      const decodedToken = DecodeJWT(token);
      if (!decodedToken) throw new Error("Invalid token.");

      const messages = await this.loadMessages(chatId, decodedToken);
      ws.send(JSON.stringify({ type: "Post", payload: { messages } }));
      Logger.info("WebSocket connection successfully. Messages sent");

      ws.on("message", this.onMessage);
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

  private onMessage = async (data: string): Promise<void> => {
    const { type, message, token }: { type: MessageType; message: ChatMessage; token: string } = JSON.parse(data);
    try {
      const user = await this.validateUser(token);
      const hasAccess = await chatUserRepository.checkUserChatConnection(user?.id, message?.chat);
      if (!user || !hasAccess) return;
      if (user.id !== message.from) return;
      const event = await this.handleMessageType(type, message, user.id);
      this.broadcast(event);
    } catch (error) {
      Logger.error("Error handling message:" + error);
    }
  };

  private async handleMessageType(type: MessageType, message: ChatMessage, userId: number): Promise<WebSocketEvent> {
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

  private async handlePostMessage(message: ChatMessage, userId: number): Promise<WebSocketEvent> {
    const newMessage = await messageService.createMessage(message.text, message.chat, userId);
    const files = await this.saveFiles(message.files, newMessage!.id);

    return this.webSocketEventFabric("Post", [
      {
        ...newMessage,
        files,
      },
    ]);
  }

  private async saveFiles(files: UploadedFile[], messageId: number): Promise<UploadedFile[]> {
    const uploadsDir = this.getUploadsDir();
    const savedFiles: UploadedFile[] = [];

    for (const file of files) {
      const fileUUID = uuid.v4();
      const filePath = path.join(uploadsDir, fileUUID);
      const fileData = Buffer.from(file.data.trim(), "base64");

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      await fs.promises.writeFile(filePath, fileData);
      await fileRepository.createFile(fileUUID, messageId, file.name);

      savedFiles.push({
        id: fileUUID,
        name: file.name,
        data: file.data,
      });
    }

    return savedFiles;
  }

  private handleDeleteMessage(message: ChatMessage): WebSocketEvent {
    fileRepository
      .findAllBy({ message_id: message.id })
      .then((files) => files.forEach((file) => fs.unlinkSync(path.join(this.getUploadsDir(), file.id))))
      .catch(console.error);

    messageService.deleteMessage(message.id);
    return this.webSocketEventFabric("Delete", [message]);
  }

  private async handleUpdateMessage(message: ChatMessage): Promise<WebSocketEvent> {
    const updatedMessage = messageService.updateMessage(message.id, message.text);
    return this.webSocketEventFabric("Update", [updatedMessage]);
  }

  private async broadcast(event: WebSocketEvent) {
    if (!this.wss) {
      return;
    }

    const messages = event.payload.messages;
    for (const message of messages) {
      try {
        const users = await chatUserRepository.findAllBy({ chat_id: message.chat });
        const userIds = users.map((user) => user.user_id);
        for (const [clientId, client] of clients.entries()) {
          if (client.readyState === WebSocket.OPEN && userIds.includes(Number(clientId))) {
            client.send(JSON.stringify(event));
          }
        }
      } catch (error) {
        console.error(`Error broadcasting to chat ${message.chat}:`, error);
      }
    }
  }

  private async validateUser(token: string): Promise<any> {
    const decoded: JwtPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
    return userRepository.findOneBy({ id: decoded.id });
  }

  private getUploadsDir(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(dirname(__filename));
    return path.join(__dirname, "uploads");
  }

  private handleDisconnection(clientId: string): void {
    clients.delete(clientId);
    Logger.info(`Client disconnected: ${clientId}`);
  }
  private webSocketEventFabric(type: MessageType, messages: unknown): WebSocketEvent {
    return {
      type: type,
      payload: {
        messages,
      },
    };
  }
}
