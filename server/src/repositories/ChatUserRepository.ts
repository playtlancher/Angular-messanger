import { WhereOptions } from "sequelize";
import ChatUser from "../models/ChatUser";

async function checkUserChatConnection(
  userId: number,
  chatId: number,
): Promise<boolean> {
  const checked = await ChatUser.findOne({
    where: { user_id: userId, chat_id: chatId },
  });
  return !!checked;
}

async function findAllBy(params: WhereOptions<ChatUser>): Promise<ChatUser[]> {
  const chatUsers = await ChatUser.findAll({
    where: params,
  });
  return chatUsers || [];
}

export { checkUserChatConnection, findAllBy };
