import { WhereOptions } from "sequelize";
import Message from "../models/Message";
import User from "../models/User";

export default class MessageRepository {
  async createMessage(text: string, senderId: number, chatId: number): Promise<Message | null> {
    try {
      console.log(senderId);
      const message = await Message.create({
        text: text,
        chat: chatId,
        from: senderId,
      });
      return message.toJSON();
    } catch (error: any) {
      console.error(`Error creating message:${error.message}`);
      return null;
    }
  }

  async findAllBy(params: WhereOptions, order: [string, string][] = [["date", "ASC"]]): Promise<Message[]> {
    const messages = await Message.findAll({
      where: params,
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["username"],
        },
      ],
      order: order,
    });
    return messages || [];
  }

  async findOneBy(params: WhereOptions): Promise<Message | void> {
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

  async deleteMessage(messageId: number): Promise<void> {
    await Message.destroy({
      where: {
        id: messageId,
      },
    });
  }

  async updateMessage(messageId: number, text: string): Promise<Message | null> {
    const message = await Message.findOne({ where: { id: messageId } });
    if (!message) return null;
    await message.update({ text: text });
    return message;
  }
}
