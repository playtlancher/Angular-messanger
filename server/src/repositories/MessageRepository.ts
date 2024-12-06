import { WhereOptions } from "sequelize";
import Message from "../models/Message";
import User from "../models/User";

async function createMessage(
  text: string,
  senderId: number,
  chatId: number,
): Promise<Message | null> {
  try {
    const message = await Message.create({
      chat: chatId,
      from: senderId,
      text: text,
    });
    return message.toJSON();
  } catch (error: any) {
    console.error(`Error creating message:${error.message}`);
    return null;
  }
}

async function findAllBy(params: WhereOptions): Promise<Message[]> {
  const messages = await Message.findAll({
    where: params,
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["username"],
      },
    ],
  });
  return messages || [];
}

async function findOneBy(params: WhereOptions): Promise<Message | void> {
  const message = await Message.findOne({
    where: params,
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["username"],
      },
    ],
  });
  if (message) return message.toJSON();
}

export { createMessage, findAllBy, findOneBy };
