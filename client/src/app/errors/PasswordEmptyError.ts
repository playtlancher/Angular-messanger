export class PasswordEmptyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordEmptyError';
  }
}
