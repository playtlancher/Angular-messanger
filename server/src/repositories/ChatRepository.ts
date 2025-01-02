import { where, WhereOptions } from "sequelize";
import Chat from "../models/Chat";

export default class ChatRepository {
  async createChat(name: string) {
    try {
      return await Chat.create({ name });
    } catch (error) {
      console.error("Error creating chat-sidebar-item:", error);
      throw error;
    }
  }

  async findAllBy(params: WhereOptions): Promise<Chat[]> {
    return await Chat.findAll({
      where: params,
    });
  }

  async findOneBy(params: WhereOptions<Chat>): Promise<Chat | null> {
    return await Chat.findOne({
      where: params,
    });
  }

  deleteChat(id: number): void {
    Chat.destroy({ where: { id: id } });
  }
}
