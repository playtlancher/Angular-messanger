import { WhereOptions } from "sequelize";
import Chat from "../models/Chat";

export default class ChatRepository {
  async createChat(name: string) {
    try {
      return await Chat.create({ name });
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  }

  findAllBy = async (params: WhereOptions): Promise<Chat[]> => {
    return await Chat.findAll({
      where: params,
    });
  };

  findOneBy = async (params: WhereOptions<Chat>): Promise<Chat | null> => {
    return await Chat.findOne({
      where: params,
    });
  };
}
