import UserRepository from "../repositories/UserRepository";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export interface AuthResponse {
  status: number;
  message: string;
  accessToken?: string;
  refreshToken?: string;
}

export default class UserService {
  private userRepository = new UserRepository();

  register = async (username: string, password: string): Promise<AuthResponse> => {
    const isUserExist = await this.userRepository.findAllBy({ username });
    if (isUserExist.length > 0) {
      return { status: 400, message: "User with this username already exists" };
    }
    await this.userRepository.createUser(username, password);
    return { status: 200, message: "Successfully registered" };
  };

  login = async (username: string, password: string): Promise<AuthResponse> => {
    const user = await this.userRepository.findOneBy({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { status: 401, message: "Incorrect username or password" };
    }
    const { accessToken, refreshToken } = this.createTokens({
      id: user.id,
      username: user.username,
    });
    return {
      status: 200,
      message: "Login successful",
      accessToken,
      refreshToken,
    };
  };

  refreshAccessToken = async (oldRefreshToken: string): Promise<AuthResponse> => {
    const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;

    const { accessToken, refreshToken } = this.createTokens({
      id: decoded.id,
      username: decoded.username,
    });
    return {
      status: 200,
      message: "Login successful",
      accessToken,
      refreshToken,
    };
  };

  createTokens = (payload: object) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
  };
}
