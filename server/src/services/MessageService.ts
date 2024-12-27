import MessageRepository from "../repositories/MessageRepository";
import { ServiceResponse } from "../interfaces/ServiceResponse";

export default class MessageService {
  messageRepository = new MessageRepository();

  createMessage = async (message: string, chatId: number, id: number): Promise<ServiceResponse> => {
    const payload = await this.messageRepository.createMessage(message, chatId, id);
    if (payload === null) {
      return {
        status: 500,
        message: "Internal server error. Please try later",
      };
    }
    return { status: 200, message: "Message created successfully", payload };
  };
}
