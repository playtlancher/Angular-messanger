import * as UserRepository from "../repositories/UserRepository";
import jwt, {JwtPayload} from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function register(
  username: string,
  password: string,
  confirmPassword: string,
  res: Response,
) {
  try {
    const isUserExist = await UserRepository.findAllBy({ username });
    if (isUserExist && isUserExist.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this username already exists" });
    }

    if (username.trim() === "") {
      return res.status(400).json({ message: "Username is required" });
    }
    if (username.includes(" ")) {
      return res
        .status(400)
        .json({ message: "Username should not contain spaces" });
    }

    if (password.trim() === "") {
      return res.status(400).json({ message: "Password is required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    await UserRepository.createUser(username, password);
    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .send("Internal server error. Please try again later.");
  }
}

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password }: { username: string; password: string } =
      req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const user = await UserRepository.findOneBy({ username: username });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const secret: string = process.env.ACCESS_TOKEN_SECRET as string;
    const refreshSecret: string = process.env.REFRESH_TOKEN_SECRET as string;
    if (!secret) {
      return res
        .status(500)
        .json({ message: "JWT secret key not configured." });
    }

    const payload = { id: user.id, username: user.username };
    const accessToken = jwt.sign(payload, secret, { expiresIn: "1h" });
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });

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
    res.status(200).json({
      message: "User successfully logged in.",
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
}

function refreshAccessToken(req: Request, res: Response){
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).send("Refresh token is not provided");
    return;
  }
  const secret = process.env.ACCESS_TOKEN_SECRET as string;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET as string;
  const decoded = jwt.verify(refreshToken, refreshSecret) as JwtPayload;
  if (decoded) {
    const user = decoded.user;
    const accessToken = jwt.sign(user, secret, { expiresIn: "1h" });
    const refreshToken = jwt.sign(user, refreshSecret, { expiresIn: "7d" });
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
    res.status(200).json({
      message: "Token refreshed successfully.",
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
}

export { register, login, refreshAccessToken };
