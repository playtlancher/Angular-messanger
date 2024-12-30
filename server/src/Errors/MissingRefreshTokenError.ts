export class MissingRefreshTokenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MissingRefreshTokenError";
    }
}