export class UserExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserExistsError";
  }
}
