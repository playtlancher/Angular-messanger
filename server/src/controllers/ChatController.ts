import express from "express";
import ChatService from "../services/ChatService";
import FileService from "../services/FileService";
import { Controller, Cookies, Delete, Get, Params, Post, Request, Response } from "@decorators/express";
import DecodeJWT from "../Utils/DecodeJWT";
import Logger from "../Utils/Logger";
import { FileNotFoundError } from "../errors/FileNotFoundError";
import { AccessForbiddenError } from "../errors/AccessForbiddenError";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import * as uuid from "uuid";
import UserService from "../services/UserService";
import CheckUserAccess from "../Utils/CheckUserAccess";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(__filename));
const chatImagesDir = path.join(__dirname, "chatImages");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, chatImagesDir);
  },
  filename: (req, file, cb) => {
    cb(null, uuid.v4() + path.extname(file.originalname));
  },
});
@Controller("/chats")
export default class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly fileService: FileService,
    private readonly userService: UserService,
  ) {
    this.chatService = new ChatService();
    this.fileService = new FileService();
    this.userService = new UserService();
  }

  @Get("/")
  async getUserChat(@Response() res: express.Response, @Cookies("accessToken") accessToken: string): Promise<unknown> {
    try {
      const decodedToken = DecodeJWT(accessToken);

      if (!decodedToken) return res.status(404).json("Chats for user not found");

      const chats = await this.chatService.getChats(decodedToken);

      res.status(200).json(chats);
    } catch (e) {
      Logger.error("Server error:", e);
      res.status(500).send("Internal Server Error. Please try again later.");
    }
  }

  // @Get("/:id")
  // async getChatMessages(@Response() res: express.Response, @Cookies("accessToken") accessToken: string, @Params("id") id: number): Promise<void> {
  //   const token = DecodeJWT(accessToken);
  //   try {
  //     const messages = await this.chatService.getChatMessages(id as number, token);
  //     res.status(200).json(messages);
  //   } catch (e) {
  //     switch (true) {
  //       case e instanceof AccessForbiddenError: {
  //         Logger.error("Access ForbiddenError", e.message);
  //         res.status(403).send("Access to this chat is forbidden");
  //         break;
  //       }
  //       default: {
  //         Logger.error("Server error:", e);
  //         res.status(500).send("Internal server error");
  //       }
  //     }
  //   }
  // }

  @Post("/")
  async createChat(@Response() res: express.Response, @Request() req: express.Request): Promise<void> {
    const token = DecodeJWT(req.cookies.accessToken);
    const { name } = req.body;
    if (!token) {
      res.status(401).send("Invalid Token");
      return;
    }
    try {
      const chat = await this.chatService.createChat(name, token);
      res.status(200).json(chat);
    } catch (e) {
      switch (true) {
        default: {
          Logger.error("Server error:", e);
          res.status(500).send("Internal server error");
        }
      }
    }
  }

  @Delete("/:id")
  async deleteChat(@Response() res: express.Response, @Request() req: express.Request, @Params("id") id: number): Promise<unknown> {
    Logger.info(`Deleting chat ${id}`);
    try {
      const token = DecodeJWT(req.cookies.accessToken);
      if (!token) return res.status(401).send("Invalid Token");

      this.chatService.deleteChat(id, token);
      return  res.status(200).json(`Chat ${id} successfully deleted.`);
    } catch (e) {
      switch (true) {
        case e instanceof AccessForbiddenError: {
          Logger.error("Access ForbiddenError", e.message);
          res.status(403).send("Access to this chat is forbidden");
          break;
        }
        default: {
          Logger.error("Server error:", e);
          res.status(500).send("Internal server error");
        }
      }
    }
  }

  @Get("/file/:id")
  async getFile(@Response() res: express.Response, @Params("id") id: number): Promise<unknown> {
    try {
      const fileData = await this.fileService.getFilePath(id);
      if (!fileData) return;
      res.setHeader("Content-Disposition", `attachment; filename="${fileData.fileName}"`);
      res.status(200).sendFile(fileData.filePath);
    } catch (e) {
      switch (true) {
        case e instanceof FileNotFoundError: {
          Logger.error("File not found error: ", e.message);
          res.status(404).send("File not found");
          break;
        }
        default: {
          Logger.error("Server error:", e);
          res.status(500).send("Internal server error");
        }
      }
    }
  }

  @Get("/image/:id")
  async getChatImage(@Cookies("accessToken") token: string, @Response() res: express.Response, @Params("id") id: number): Promise<unknown> {
    const decodedToken = DecodeJWT(token);
    if (!decodedToken) return res.status(401).send("Invalid Token");

    const user = await this.userService.getUserById(decodedToken.id);
    if (!user) return res.status(404).send("User not found");

    const chat = await this.chatService.getChatById(id);
    if (!chat) return res.status(404).send("Chat not found");

    const HasAccess = CheckUserAccess(user.id, chat.id);
    if (!HasAccess) return res.status(401).send("Forbidden access to this chat");

    let filePath = path.join(chatImagesDir, chat!.image);

    return res.status(200).sendFile(filePath);
    // return res.status(200).send("work")
  }
}
