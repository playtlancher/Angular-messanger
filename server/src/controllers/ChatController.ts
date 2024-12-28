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
    try {
      const chats = await this.chatService.getChats(DecodeJWT(accessToken));
      res.status(200).json(chats);
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal Server Error. Please try again later.");
    }
  }

  @Get("/chat/:id")
  async getChatMessages(@Response() res: express.Response, @Cookies("accessToken") accessToken: string, @Params("id") id: number): Promise<void> {
    const token = DecodeJWT(accessToken);
    try {
      const messages = await this.chatService.getChatMessages(id as number, token);
      res.status(200).json(messages);
    } catch (e) {
      const error = e as Error;
      switch (error.message) {
        case "Access to this chat is forbidden": {
          res.status(403).send("Access to this chat is forbidden");
          break;
        }
        default: {
          res.status(500).send("Internal server error");
        }
      }
    }
  }

  @Post("/chats")
  async createChat(@Response() res: express.Response, @Request() req: express.Request): Promise<void> {
    const token = DecodeJWT(req.cookies.accessToken);
    const { username, name } = req.body;

    try {
      const chat = await this.chatService.createChat(name, username, token);
      res.status(200).json(chat);
    } catch (e) {
      const error = e as Error;
      switch (error.message) {
        case "User not found": {
          res.status(404).send("User not found");
          break;
        }
        default: {
          res.status(500).send("Internal server error");
        }
      }
    }
  }

  @Post("chat/:id")
  async createMessage(@Response() res: express.Response, @Request() req: express.Request): Promise<void> {
    const chatId = Number(req.params.chat_id);
    const token = DecodeJWT(req.cookies.accessToken);
    if (!(await CheckUserAccess(token!.id, chatId))) {
      res.status(403).send("User has no access to this chat");
      return;
    }
    const result = await this.messageService.createMessage(req.body.message.text, chatId, token!.id);
    res.status(200).json(result);
  }

  @Get("/file/:id")
  async getFile(@Response() res: express.Response, @Params("id") id: number): Promise<void> {
    try {
      const fileData = await this.fileService.getFilePath(id);
      if (!fileData) return;
      res.setHeader("Content-Disposition", `attachment; filename="${fileData.fileName}"`);
      res.status(200).sendFile(fileData.filePath);
    } catch (e) {
      const error = e as Error;
      switch (error.message) {
        case "File not found": {
          res.status(404).send("File not found");
          break;
        }
        default: {
          res.status(500).send("Internal server error");
        }
      }
    }
  }
}
