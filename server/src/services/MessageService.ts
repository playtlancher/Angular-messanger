import MessageRepository from "../repositories/MessageRepository";
import Message from "../models/Message";

export default class MessageService {
  messageRepository = new MessageRepository();

  async createMessage(message: string, chatId: number, id: number): Promise<Message | null> {
    return await this.messageRepository.createMessage(message, chatId, id);
  }
  deleteMessage(id: number): Promise<void> {
    return this.messageRepository.deleteMessage(id);
  }
  async updateMessage(id: number, text: string): Promise<Message | null> {
    return await this.messageRepository.updateMessage(id, text);
  }
}
