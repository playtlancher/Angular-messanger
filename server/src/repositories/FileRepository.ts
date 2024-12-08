import { WhereOptions } from "sequelize";
import File from "../models/File";
export default class FileRepository {

    async createFile(
        id: string,
        messageId: number,
        name: string,
    ): Promise<File | null> {
        try {
            const file = await File.create({
                id: id,
                message_id: messageId,
                file_name: name,
            });
            return file.toJSON();
        } catch (error: any) {
            console.error(`Error creating message:${error.message}`);
            return null;
        }
    }


    async findAllBy(params: WhereOptions): Promise<File[]> {
        const files = await File.findAll({
            where: params,
        });
        return files || [];
    }


    async findOneBy(params: WhereOptions): Promise<File | void> {
        const file = await File.findOne({
            where: params,
        });
        if (file) return file.toJSON();
    }


    async deleteFile(id: number): Promise<void> {
        await File.destroy({
            where: {
                id: id,
            },
        });
    }
}