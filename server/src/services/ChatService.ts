import ChatUserRepository from "../repositories/ChatUserRepository";
import MessageRepository from "../repositories/MessageRepository";
import ChatRepository from "../repositories/ChatRepository";
import UserRepository from "../repositories/UserRepository";
import DecodedToken from "../interfaces/DecodedToken";
import Message from "../models/Message";
import Chat from "../models/Chat";
import { AccessForbiddenError } from "../errors/AccessForbiddenError";

export default class ChatService {
  private chatUserRepository = new ChatUserRepository();
  private messageRepository = new MessageRepository();
  private chatRepository = new ChatRepository();
  private userRepository = new UserRepository();

  public getChats = async (token: DecodedToken): Promise<Awaited<Chat | null>[]> => {
    const userChats = await this.chatUserRepository.findAllBy({
      user_id: token.id,
    });
    return await Promise.all(userChats.map(this.getChatDetails));
  };

  public getChatMessages = async (chatId: number, token: DecodedToken): Promise<Message[]> => {
    const hasAccess = await this.hasChatAccess(token.id, chatId);
    if (!hasAccess) {
      throw new AccessForbiddenError("Access to this chat is forbidden");
    }
    return await this.getMessagesForChat(chatId);
  };

  public createChat = async (chatName: string, token: DecodedToken): Promise<Chat> => {
    const chat = await this.chatRepository.createChat(chatName);
    await Promise.all([this.chatUserRepository.createConnection(token.id, chat.id), this.chatUserRepository.createConnection(token.id, chat.id)]);
    return chat;
  };
  public deleteChat(chatId: number, token: DecodedToken): void {
    const hasAccess = this.hasChatAccess(token.id, chatId);
    if (!hasAccess) throw new AccessForbiddenError("Access to this chat is forbidden");
    this.chatRepository.deleteChat(chatId);
  }
  public async getChatById(chatId: number): Promise<Chat | null> {
    return await this.chatRepository.findOneBy({ id: chatId });
  }

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
    return await this.messageRepository.findAllBy({ chat: chatId });
  };

  private hasChatAccess = async (userId: number, chatId: number): Promise<boolean> => {
    const connections = await this.chatUserRepository.findAllBy({
      user_id: userId,
      chat_id: chatId,
    });
    return connections.length > 0;
  };
}
