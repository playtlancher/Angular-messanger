import { WhereOptions } from "sequelize";
import File from "../models/File";

export default class FileRepository {
  createFile = async (id: string, messageId: number, name: string) => {
    try {
      const file = await File.create({
        id: id,
        message_id: messageId,
        name: name,
      });
      return file.toJSON();
    } catch (error: any) {
      console.error(`Error creating message:${error.message}`);
    }
  };

  findAllBy = async (params: WhereOptions): Promise<File[]> => {
    const files = await File.findAll({
      where: params,
    });
    return files || [];
  };

  findOneBy = async (params: WhereOptions): Promise<File | void> => {
    const file = await File.findOne({
      where: params,
    });
    if (file) return file.toJSON();
  };

  deleteFile = async (id: number): Promise<void> => {
    await File.destroy({
      where: {
        id: id,
      },
    });
  };
}
