import express from "express";
import ChatService from "../services/ChatService";
import FileService from "../services/FileService";
import MessageService from "../services/MessageService";
import { Get, Post, Controller, Response, Request } from "@decorators/express";

@Controller("/")
export default class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly fileService: FileService,
  ) {
    this.chatService = new ChatService();
    this.messageService = new MessageService();
    this.fileService = new FileService();
  }

  @Get("/chats")
  async getUserChat(@Response() res: express.Response, @Request() req: express.Request): Promise<unknown> {
    return this.chatService.getChats(req, res);
  }

  @Get("chat/:id")
  async getChatMessages(@Response() res: express.Response, @Request() req: express.Request): Promise<void> {
    await this.chatService.getChatMessages(req, res);
  }

  @Post("chat/:id")
  async postMessage(@Response() res: express.Response, @Request() req: express.Request): Promise<void> {
    await this.messageService.postMessage(req, res);
  }

  @Get("/file/:id")
  async getFile(@Response() res: express.Response, @Request() req: express.Request): Promise<void> {
    await this.fileService.getFile(req, res);
  }

  @Post("/chats")
  async postChat(@Response() res: express.Response, @Request() req: express.Request): Promise<void> {
    console.log("PostChat");
    await this.chatService.postChat(req, res);
  }
}
