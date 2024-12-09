import DecodeJWT from "../utilities/DecodeJWT";
import { Request, Response } from "express";
import ChatUserRepository from "../repositories/ChatUserRepository";
import MessageRepository from "../repositories/MessageRepository";
import ChatRepository from "../repositories/ChatRepository";
import UserRepository from "../repositories/UserRepository";

export default class ChatService {
  private chatUserRepository = new ChatUserRepository();
  private messageRepository = new MessageRepository();
  private chatRepository = new ChatRepository();
  private userRepository = new UserRepository();

  getChats = async (req: Request, res: Response): Promise<void> => {
    const token = DecodeJWT(req.cookies.accessToken, res);
    if (!token) return;

    try {
      const chatConnections = await this.chatUserRepository.findAllBy({ user_id: token.id });
      if (!chatConnections.length) {
        res.status(404).json({ message: "No chats found for this user." });
        return;
      }

      const chats = await Promise.all(chatConnections.map(this.fetchChat));
      res.status(200).json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ message: "Internal server error. Please try again later." });
    }
  };

  getChatMessages = async (req: Request, res: Response): Promise<void> => {
    const chatId = Number(req.params.chat_id);
    const token = DecodeJWT(req.cookies.accessToken, res);
    if (!token) return;

    try {
      const hasAccess = await this.checkUserAccess(token.id, chatId);
      if (!hasAccess) {
        res.status(403).json({ message: "You do not have access to this chat." });
        return;
      }

      const messages = await this.fetchMessages(chatId);
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal server error. Please try again later." });
    }
  };

  postChat = async (req: Request, res: Response): Promise<void> => {
    const { username, name } = req.body;
    const token = DecodeJWT(req.cookies.accessToken, res);
    if (!token) return;

    try {
      const chat = await this.chatRepository.createChat(name);
      if (!chat) {
        res.status(500).json({ message: "Failed to create chat." });
        return;
      }

      const user = await this.userRepository.findOneBy({ username });
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      await Promise.all([
        this.chatUserRepository.createConnection(token.id, chat.id),
        this.chatUserRepository.createConnection(user.id, chat.id),
      ]);

      res.status(201).json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(500).json({ message: "Internal server error. Please try again later." });
    }
  };

  private fetchChat = async (chat: any): Promise<any> => {
    const result = await this.chatRepository.findOneBy({ id: chat.chat_id });
    if (!result) throw new Error(`Chat ID ${chat.chat_id} not found`);
    return result;
  };

  private fetchMessages = async (chatId: number): Promise<any[]> => {
    const messages = await this.messageRepository.findAllBy({ chat: chatId });
    if (!messages.length) {
      throw new Error("No messages found for this chat.");
    }
    return messages.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  private checkUserAccess = async (userId: number, chatId: number): Promise<boolean> => {
    const connections = await this.chatUserRepository.findAllBy({
      user_id: userId,
      chat_id: chatId,
    });
    return connections.length > 0;
  };
}
