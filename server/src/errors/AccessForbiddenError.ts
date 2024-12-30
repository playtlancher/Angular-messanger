export class AccessForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessForbiddenError";
  }
}
