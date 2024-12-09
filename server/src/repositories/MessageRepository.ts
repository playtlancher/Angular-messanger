import { WhereOptions } from "sequelize";
import Message from "../models/Message";
import User from "../models/User";

export default class MessageRepository {
  createMessage = async (text: string, senderId: number, chatId: number): Promise<Message | null> => {
    try {
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
  };

  findAllBy = async (params: WhereOptions): Promise<Message[]> => {
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
  };

  findOneBy = async (params: WhereOptions): Promise<Message | void> => {
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
  };

  deleteMessage = async (messageId: number): Promise<void> => {
    await Message.destroy({
      where: {
        id: messageId,
      },
    });
  };

  updateMessage = async (messageId: number, text: string): Promise<Message | null> => {
    const message = await Message.findOne({ where: { id: messageId } });
    if (!message) return null;
    await message.update({ text: text });
    return message;
  };
}
