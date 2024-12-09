import DecodeJWT from "../utilities/DecodeJWT";
import { Request, Response } from "express";
import CheckUserAccess from "../utilities/CheckUserAccess";
import MessageRepository from "../repositories/MessageRepository";

export default class MessageService {
  messageRepository = new MessageRepository();

  postMessage = async (req: Request, res: Response) => {
    const chatId = Number(req.params.chat_id);
    const { message } = req.body;
    if (!message?.text) res.status(400).send("Invalid message format.");

    const token = DecodeJWT(req.cookies.accessToken, res);
    if (!token) return;
    try {
      if (!(await CheckUserAccess(token.id, chatId))) {
        res.status(403).send("User has no access to this chat.");
      }

      const createdMessage = await this.messageRepository.createMessage(message.text, chatId, token.id);
      if (!createdMessage) res.status(500).send("Failed to create message.");

      res.status(201).json(createdMessage);
    } catch (error) {
      res.status(500).json({ message: "Internal server error. Please try again later." });
    }
  };
}
