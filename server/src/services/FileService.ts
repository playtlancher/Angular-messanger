import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import FileRepository from "../repositories/FileRepository";

export default class FileService {
  fileRepository = new FileRepository();

  async getFilePath(fileId: number): Promise<{ filePath: string; fileName: string } | null> {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, "..", "uploads", String(fileId));

    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }

    const file = await this.fileRepository.findOneBy({ id: fileId });
    if (!file) {
      throw new Error("File not found");
    }

    return { filePath, fileName: file.name };
  }
}
