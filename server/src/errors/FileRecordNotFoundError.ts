export class FileRecordNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileRecordNotFoundError";
  }
}
