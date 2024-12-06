import { WhereOptions } from "sequelize";
import Chat from "../models/Chat";

async function createChat(name: string): Promise<Chat | null> {
  try {
    const chat = await Chat.create({
      name,
    });
    return chat.toJSON();
  } catch (err: any) {
    console.log(err.message);
    return null;
  }
}

async function findAllBy(params: WhereOptions): Promise<Chat[]> {
  return await Chat.findAll({
    where: params,
  });
}

async function findOneBy(params: WhereOptions<Chat>): Promise<Chat | null> {
  return await Chat.findOne({
    where: params,
  });
}

export { createChat, findAllBy, findOneBy };
