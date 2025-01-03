import { Controller, Get, Post, Request, Response } from "@decorators/express";
import UserService from "../services/UserService";
import express from "express";
import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";
import fs from "fs";
import multer from "multer";
import * as uuid from "uuid";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(__filename));
const avatarsDir = path.join(__dirname, "avatars");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    cb(null, uuid.v4() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

@Controller("/users")
export default class UserController {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @Get("/")
  async getUsers(@Response() res: express.Response): Promise<void> {
    const users = await this.userService.getUsers();
    res.status(200).send(users);
  }

  @Get("/avatar")
  async getAvatar(@Response() res: express.Response, @Request() req: express.Request): Promise<unknown> {
    const user = await this.userService.getCurrentUser(req.cookies.accessToken);
    if (!user) return res.status(404).send("User not found");
    let filePath = path.join(avatarsDir, user!.avatar);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(avatarsDir, "avatar.png")
    }
    return res.status(200).sendFile(filePath);
  }

  @Post("/avatar")
  async postAvatar(
      @Request() req: express.Request,
      @Response() res: express.Response
  ): Promise<void> {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error uploading file.");
      }
      const user = await this.userService.getCurrentUser(req.cookies.accessToken);
      if (!user) return  res.status(404).send("User not found");
      await this.userService.updateUserAvatar(user.id, req.file!.filename);

      res.status(200).json("Avatar uploaded successfully");
    });
  }
}
