import UserService from "../services/UserService";
import express from "express";
import { Controller, Cookies, Get, Post, Request, Response } from "@decorators/express";

@Controller("/")
export default class UserController {
  private userService: UserService = new UserService();

  @Post("/login")
  async login(@Response() res: express.Response, @Request() req: express.Request, next: express.NextFunction): Promise<unknown> {
    try {
      const { username, password } = req.body;
      const { status, message, accessToken, refreshToken } = await this.userService.login(username, password);

      if (status !== 200 || !accessToken || !refreshToken) {
        res.status(status).json({ message });
        return;
      } else {
        this.setTokens(accessToken, refreshToken, res);
        res.status(200).json({
          message: "User successfully logged in",
          accessToken,
          refreshToken,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  @Post("/registration")
  async registration(@Response() res: express.Response, @Request() req: express.Request): Promise<void> {
    try {
      const { username, password, confirmPassword } = req.body;
      if (username.trim() === "" || username.includes(" ")) {
        res.status(400).json({ message: "Invalid username" });
        return;
      }
      if (password.trim() === "" || password !== confirmPassword) {
        res.status(400).json({ message: "Password mismatch or empty" });
        return;
      }
      const result = await this.userService.register(username, password);
      console.log(result);
      const { status, message } = result;
      res.status(status).json({ message });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  }

  @Post("/refresh-access-token")
  async refreshAccessToken(@Response() res: express.Response, @Cookies("refreshToken") oldRefreshToken: string): Promise<void> {
    try {
      if (!oldRefreshToken) {
        res.status(401).send("Refresh token is not provided");
        return;
      }
      const { accessToken, refreshToken, status, message } = await this.userService.refreshAccessToken(oldRefreshToken);
      if (status != 200 || !accessToken || !refreshToken) {
        res.status(status).send(message);
        return;
      }
      this.setTokens(accessToken, refreshToken, res);
      res.status(200).json({
        message: "Token refreshed successfully.",
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }

  @Get("/logout")
  async logout(@Response() res: express.Response): Promise<void> {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      res.status(200).send("User logged out successfully");
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }

  private setTokens(accessToken: string, refreshToken: string, res: express.Response) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }
}
