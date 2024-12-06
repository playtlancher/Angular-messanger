import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import * as ChatUserRepository from "../repositories/ChatUserRepository";
import * as ChatRepository from "../repositories/ChatRepository";
import * as MessageRepository from "../repositories/MessageRepository";

interface DecodedToken {
  id: number;
  username: string;
  iat: number;
  exp: number;
}

async function getUserChats(
  req: Request,
  res: Response,
  next: any,
): Promise<void> {
  const token = verifyToken(req, res);
  if (!token) return;
  try {
    const chatIDs = await ChatUserRepository.findAllBy({
      user_id: token.id,
    });
    if (!chatIDs || chatIDs.length === 0)
      res.status(404).send("No chats found for this user.");

    const chats = await Promise.all(chatIDs.map(fetchChat));
    res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
}

async function getChatMessages(req: Request, res: Response): Promise<void> {
  const chatId = Number(req.params.chat_id);
  const token = verifyToken(req, res);
  if (!token) return;

  try {
    if (!(await checkUserAccess(token.id, chatId))) {
      res.status(403).send("User has no access to this chat.");
    }

    const messages = await fetchMessages(chatId);
    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
}

async function postMessage(req: Request, res: Response): Promise<void> {
  const chatId = Number(req.params.chat_id);
  const { message } = req.body;
  if (!message?.text) res.status(400).send("Invalid message format.");

  const token = verifyToken(req, res);
  if (!token) return;
  console.log(token);
  try {
    if (!(await checkUserAccess(token.id, chatId))) {
      res.status(403).send("User has no access to this chat.");
    }

    const createdMessage = await MessageRepository.createMessage(
      message.text,
      chatId,
      token.id,
    );
    if (!createdMessage) res.status(500).send("Failed to create message.");

    res.status(201).json(createdMessage);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
}

function verifyToken(req: Request, res: Response): DecodedToken | null {
  try {
    const token = req.cookies.accessToken;
    const secret = process.env.ACCESS_TOKEN_SECRET;
    return jwt.verify(token, secret!) as DecodedToken;
  } catch {
    res.status(403).send("Unauthorized");
    return null;
  }
}

async function checkUserAccess(
  userId: number,
  chatId: number,
): Promise<boolean> {
  const result = await ChatUserRepository.findAllBy({
    user_id: userId,
    chat_id: chatId,
  });
  return result.length > 0;
}

async function fetchChat(chat: any) {
  const result = await ChatRepository.findOneBy({ id: chat.chat_id });
  if (!result) throw new Error(`Chat ID ${chat.chat_id} not found`);
  return result;
}

async function fetchMessages(chatId: number) {
  const messages = await MessageRepository.findAllBy({ chat: chatId });
  if (!messages || messages.length === 0)
    throw new Error("No messages found for this chat.");
  return messages.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export { getUserChats, getChatMessages, postMessage };
