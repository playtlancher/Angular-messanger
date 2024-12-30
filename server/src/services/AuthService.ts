import UserRepository from "../repositories/UserRepository";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { MissingRefreshTokenError } from "../errors/MissingRefreshTokenError";
import { IncorrectUsernameOrPasswordError } from "../errors/IncorrectUsernameOrPasswordError";
import { UserExistsError } from "../errors/UserExistError";

dotenv.config();

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export default class AuthService {
  private userRepository = new UserRepository();

  async register(username: string, password: string) {
    const isUserExist = await this.userRepository.findAllBy({ username });
    if (isUserExist.length > 0) {
      throw new UserExistsError("User with this username already exists");
    }
    await this.userRepository.createUser(username, password);
  }

  async login(username: string, password: string): Promise<Tokens> {
    const user = await this.userRepository.findOneBy({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new IncorrectUsernameOrPasswordError("Incorrect username or password");
    }
    const { accessToken, refreshToken } = this.createTokens({
      id: user.id,
      username: user.username,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(oldRefreshToken: string): Promise<Tokens> {
    if (!oldRefreshToken) {
      throw new MissingRefreshTokenError("Refresh token is missing");
    }
    const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;

    const { accessToken, refreshToken } = this.createTokens({
      id: decoded.id,
      username: decoded.username,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  createTokens(payload: object): Tokens {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
  }
}
