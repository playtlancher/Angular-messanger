import * as userService from "../services/UserService";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

async function postLogin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await userService.login(req, res, next);
  } catch (error) {
    next(error);
  }
}

async function postRegistration(req: Request, res: Response): Promise<void> {
  const { username, password, confirmPassword } = req.body;
  try {
    await userService.register(username, password, confirmPassword, res);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
}
function refreshAccessToken(req: Request, res: Response): void {
  userService.refreshAccessToken(req, res);
}
function logout(req: Request, res: Response): void {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).send("User logged out successfully");
}

export { postLogin, logout, postRegistration, refreshAccessToken };
