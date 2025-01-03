import AuthService from "../services/AuthService";
import express from "express";
import { Controller, Cookies, Get, Post, Request, Response } from "@decorators/express";
import { UserExistsError } from "../errors/UserExistError";
import { IncorrectUsernameOrPasswordError } from "../errors/IncorrectUsernameOrPasswordError";
import { MissingRefreshTokenError } from "../errors/MissingRefreshTokenError";
import Logger from "../Utils/Logger";

@Controller("/auth")
export default class AuthController {
  constructor(private readonly authService: AuthService) {
    this.authService = new AuthService();
  }

  @Post("/login")
  async login(@Response() res: express.Response, @Request() req: express.Request, next: express.NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      const { accessToken, refreshToken } = await this.authService.login(username, password);

      this.setTokens(accessToken, refreshToken, res);
      res.status(200).json({
        message: "User successfully logged in",
        accessToken,
        refreshToken,
      });
    } catch (e) {
      switch (true) {
        case e instanceof IncorrectUsernameOrPasswordError: {
          Logger.error("IncorrectUsernameOrPasswordError", e);
          res.status(401).send(e.message);
          break;
        }
        default: {
          Logger.error("Server error:", e);
          res.status(500).send("Internal server error");
        }
      }
    }
  }

  @Post("/registration")
  async registration(@Response() res: express.Response, @Request() req: express.Request): Promise<void> {
    try {
      const { username, password } = req.body;
      await this.authService.register(username, password);
      res.status(200).json("User successfully registered");
    } catch (e) {
      switch (true) {
        case e instanceof UserExistsError: {
          Logger.error("UserExistsError:", e.message);
          res.status(400).send(e.message);
          break;
        }
        default: {
          Logger.error("Server error:", e);
          res.status(500).send("Internal server error");
        }
      }
    }
  }

  @Post("/refresh-access-token")
  async refreshAccessToken(@Response() res: express.Response, @Cookies("refreshToken") oldRefreshToken: string): Promise<void> {
    console.log("Refresh access token");
    try {
      const { accessToken, refreshToken } = await this.authService.refreshAccessToken(oldRefreshToken);
      this.setTokens(accessToken, refreshToken, res);
      res.status(200).json({
        message: "Token refreshed successfully.",
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (e) {
      switch (true) {
        case e instanceof MissingRefreshTokenError: {
          Logger.error("MissingRefreshTokenError:", e.message);
          res.status(400).send(e.message);
          break;
        }
        default: {
          Logger.error("Server error:", e);
          res.status(500).send("Internal server error");
        }
      }
    }
  }

  @Get("/logout")
  async logout(@Request() req: express.Request, @Response() res: express.Response): Promise<void> {
    try {
      const cookies = req.cookies;
      Object.keys(cookies).forEach((cookieName) => {
        res.clearCookie(cookieName);
      });

      res.status(200);
    } catch (e) {
      Logger.error("Server error:", e);
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
