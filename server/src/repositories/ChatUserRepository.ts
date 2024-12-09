import { WhereOptions } from "sequelize";
import ChatUser from "../models/ChatUser";

export default class ChatUserRepository {
  createConnection = async (userId: number, chatId: number): Promise<ChatUser> => {
    return await ChatUser.create({
      user_id: userId,
      chat_id: chatId,
    });
  };

  checkUserChatConnection = async (userId: number, chatId: number): Promise<boolean> => {
    return !!(await ChatUser.findOne({
      where: { user_id: userId, chat_id: chatId },
    }));
  };

  findAllBy = async (params: WhereOptions<ChatUser>): Promise<ChatUser[]> => {
    const chatUsers = await ChatUser.findAll({
      where: params,
    });
    return chatUsers || [];
  };
}
