import ChatUserRepository from "../repositories/ChatUserRepository";
import MessageRepository from "../repositories/MessageRepository";
import ChatRepository from "../repositories/ChatRepository";
import UserRepository from "../repositories/UserRepository";
import DecodedToken from "../interfaces/DecodedToken";
import Message from "../models/Message";
import Chat from "../models/Chat";
import { ServiceResponse } from "../interfaces/ServiceResponse";

export default class ChatService {
  private chatUserRepository = new ChatUserRepository();
  private messageRepository = new MessageRepository();
  private chatRepository = new ChatRepository();
  private userRepository = new UserRepository();

  public getChats = async (token: DecodedToken): Promise<ServiceResponse> => {
    const userChats = await this.chatUserRepository.findAllBy({
      user_id: token.id,
    });
    const chats = await Promise.all(userChats.map(this.getChatDetails));
    return {
      status: 200,
      message: "Chats retrieved successfully",
      payload: chats,
    };
  };

  public getChatMessages = async (chatId: number, token: DecodedToken): Promise<ServiceResponse> => {
    const hasAccess = await this.hasChatAccess(token.id, chatId);
    if (!hasAccess) {
      return { status: 403, message: "Access to this chat is forbidden" };
    }
    const messages = await this.getMessagesForChat(chatId);
    return {
      status: 200,
      message: "Messages retrieved successfully",
      payload: messages,
    };
  };

  public createChat = async (name: string, username: string, token: DecodedToken): Promise<ServiceResponse> => {
    const chat = await this.chatRepository.createChat(name);

    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      return { status: 404, message: "User not found" };
    }

    await Promise.all([this.chatUserRepository.createConnection(token.id, chat.id), this.chatUserRepository.createConnection(user.id, chat.id)]);

    return {
      status: 200,
      message: "Chats created successfully",
      payload: chat,
    };
  };

  private getChatDetails = async (chat: { chat_id: number }): Promise<Chat | null> => {
    const chatDetails = await this.chatRepository.findOneBy({
      id: chat.chat_id,
    });
    if (!chatDetails) {
      return null;
    }
    return chatDetails;
  };

  private getMessagesForChat = async (chatId: number): Promise<Message[]> => {
    const messages = await this.messageRepository.findAllBy({ chat: chatId });
    return messages.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  private hasChatAccess = async (userId: number, chatId: number): Promise<boolean> => {
    const connections = await this.chatUserRepository.findAllBy({
      user_id: userId,
      chat_id: chatId,
    });
    return !!connections.length;
  };
}
