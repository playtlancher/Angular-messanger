export class PasswordMatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordMatchError';
  }
}
