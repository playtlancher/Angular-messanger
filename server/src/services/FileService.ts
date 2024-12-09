import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { Request, Response } from "express";
import FileRepository from "../repositories/FileRepository";

export default class FileService {
  fileRepository = new FileRepository();

  async getFile(req: Request, res: Response) {
    try {
      const fileId = req.params.id;
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const filePath = path.join(__dirname, "..", "uploads", String(fileId));
      if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found in uploads directory");
      }

      const file = await this.fileRepository.findOneBy({ id: fileId });

      if (!file) {
        return res.status(404).send("File not found");
      }

      res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);

      res.status(200).sendFile(filePath);
    } catch (error) {
      console.error("Error retrieving file:", error);
      res.status(500).send("Internal server error");
    }
  }
}
