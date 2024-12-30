import ChatUserRepository from "../repositories/ChatUserRepository";
import MessageRepository from "../repositories/MessageRepository";
import ChatRepository from "../repositories/ChatRepository";
import UserRepository from "../repositories/UserRepository";
import DecodedToken from "../interfaces/DecodedToken";
import Message from "../models/Message";
import Chat from "../models/Chat";

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
      throw new Error("Access to this chat is forbidden");
    }
    return await this.getMessagesForChat(chatId);
  };

  public createChat = async (name: string, username: string, token: DecodedToken): Promise<Chat> => {
    const chat = await this.chatRepository.createChat(name);

    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new Error("User not found");
    }

    await Promise.all([this.chatUserRepository.createConnection(token.id, chat.id), this.chatUserRepository.createConnection(user.id, chat.id)]);
    return chat;
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
    return await this.messageRepository.findAllBy({ chat: chatId }, ["createdAt", "DESC"]);
  };

  private hasChatAccess = async (userId: number, chatId: number): Promise<boolean> => {
    const connections = await this.chatUserRepository.findAllBy({
      user_id: userId,
      chat_id: chatId,
    });
    return connections.length > 0;
  };
}
