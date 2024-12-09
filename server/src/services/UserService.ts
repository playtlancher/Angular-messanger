import UserRepository from "../repositories/UserRepository";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, Request } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

export default class UserService {
  private userRepository = new UserRepository();

  register = async (req: Request, res: Response) => {
    const { username, password, confirmPassword } = req.body;
    try {
      const isUserExist = await this.userRepository.findAllBy({ username });
      if (isUserExist.length > 0) {
        return res.status(400).json({ message: "User with this username already exists" });
      }

      if (username.trim() === "" || username.includes(" ")) {
        return res.status(400).json({ message: "Invalid username" });
      }

      if (password.trim() === "" || password !== confirmPassword) {
        return res.status(400).json({ message: "Password mismatch or empty" });
      }

      await this.userRepository.createUser(username, password);
      return res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).send("Internal server error. Please try again later.");
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
      }
      const user = await this.userRepository.findOneBy({ username });
      if (!user) {
        return res.status(401).json({ message: "Incorrect username or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const secret = process.env.ACCESS_TOKEN_SECRET!;
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;
      const payload = { id: user.id, username: user.username };

      const accessToken = jwt.sign(payload, secret, { expiresIn: "1h" });
      const refreshToken = jwt.sign(payload, refreshSecret, {
        expiresIn: "7d",
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      });
      return res.status(200).json({
        message: "User successfully logged in.",
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
  };

  refreshAccessToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).send("Refresh token is not provided");
    }

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;
    const secret = process.env.ACCESS_TOKEN_SECRET!;
    try {
      const decoded = jwt.verify(refreshToken, refreshSecret) as JwtPayload;
      const user = { id: decoded.id, username: decoded.username };

      const accessToken = jwt.sign(user, secret, { expiresIn: "1h" });
      const newRefreshToken = jwt.sign(user, refreshSecret, {
        expiresIn: "7d",
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      });
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      });

      return res.status(200).json({
        message: "Token refreshed successfully.",
        access_token: accessToken,
        refresh_token: newRefreshToken,
      });
    } catch (error) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }
  };

  getUsers = async (req: Request, res: Response) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        return res.status(401).json({ message: "Access token is required" });
      }

      const secret = process.env.ACCESS_TOKEN_SECRET!;
      const decoded = jwt.verify(token, secret) as JwtPayload;
      const userId = decoded.id;

      const users = await this.userRepository.findAllBy({});
      const filteredUsers = users.filter((user) => user.id !== userId);

      return res.status(200).json(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
}
