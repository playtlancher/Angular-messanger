import express from "express";
import ChatService from "../services/ChatService";
import FileService from "../services/FileService";
import MessageService from "../services/MessageService";
import { Controller, Cookies, Get, Params, Post, Request, Response } from "@decorators/express";
import DecodeJWT from "../utilities/DecodeJWT";
import CheckUserAccess from "../utilities/CheckUserAccess";

@Controller("/")
export default class ChatController {
  private chatService = new ChatService();
  private messageService = new MessageService();
  private fileService = new FileService();
  @Get("/chats")
  async getUserChat(@Response() res: express.Response, @Cookies("accessToken") accessToken: string): Promise<void> {
    const token = DecodeJWT(accessToken);
    if (!token) {
      res.status(401).json({ message: "Authentication token is missing or invalid." });
      return;
    }
    try {
      const { status, message, payload } = await this.chatService.getChats(token);
      if (status !== 200) {
        res.status(status).send(message);
        return;
      }
      res.status(200).json(payload);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  @Get("/chat/:id")
  async getChatMessages(@Response() res: express.Response, @Cookies("accessToken") accessToken: string, @Params("id") id: number): Promise<void> {
    const token = DecodeJWT(accessToken);
    if (!token) {
      res.status(401).json({ message: "Authentication token is missing or invalid." });
      return;
    }
    try {
      const { status, message, payload } = await this.chatService.getChatMessages(Number(id), token);
      if (status !== 200) {
        res.status(status).send(message);
        return;
      }
      res.status(200).json(payload);
    } catch (error) {
      res.status(403).json({ message: error });
    }
  }

  @Post("/chats")
  async createChat(@Response() res: express.Response, @Request() req: express.Request): Promise<void> {
    const token = DecodeJWT(req.cookies.accessToken);
    if (!token) {
      res.status(401).json({ message: "Authentication token is missing or invalid." });
      return;
    }
    const { username, name } = req.body;

    try {
      const { status, message, payload } = await this.chatService.createChat(name, username, token);
      if (status !== 200) {
        res.status(status).send(message);
      }
      res.status(201).json(payload);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  @Post("chat/:id")
  async createMessage(@Response() res: express.Response, @Request() req: express.Request): Promise<void> {
    const chatId = Number(req.params.chat_id);
    const { message } = req.body;
    const token = DecodeJWT(req.cookies.accessToken);
    if (!token) return;
    if (!(await CheckUserAccess(token.id, chatId))) {
      res.status(403).send("User has no access to this chat-sidebar-item.");
    }
    const result = await this.messageService.createMessage(message.text, chatId, token.id);
    if (result.status !== 200) {
      res.status(result.status).send(result.message);
      return;
    }
    res.status(200).json(result.payload);
  }

  @Get("/file/:id")
  async getFile(@Response() res: express.Response, @Params("id") id: number): Promise<void> {
    try {
      const fileData = await this.fileService.getFilePath(id);

      if (!fileData) {
        res.status(404).json({ message: "File not found." });
        return;
      }

      res.setHeader("Content-Disposition", `attachment; filename="${fileData.fileName}"`);
      res.status(200).sendFile(fileData.filePath);
    } catch (error) {
      console.error("Error retrieving file:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
