import AuthService from "../services/AuthService";
import express from "express";
import {
  Controller,
  Cookies,
  Get,
  Post,
  Request,
  Response,
} from "@decorators/express";

@Controller("/")
export default class AuthController {
  private userService: AuthService = new AuthService();

  @Post("/login")
  async login(
    @Response() res: express.Response,
    @Request() req: express.Request,
    next: express.NextFunction,
  ): Promise<void> {
    try {
      const { username, password } = req.body;
      const { accessToken, refreshToken } = await this.userService.login(
        username,
        password,
      );

      this.setTokens(accessToken, refreshToken, res);
      res.status(200).json({
        message: "User successfully logged in",
        accessToken,
        refreshToken,
      });
    } catch (e) {
      const error = e as Error;
      console.error(error.message);
      switch (error.message) {
        case "Incorrect username or password": {
          res.status(401).json({ message: error });
          break;
        }
        default: {
          res.status(500).send("Internal server error");
        }
      }
    }
  }

  @Post("/registration")
  async registration(
    @Response() res: express.Response,
    @Request() req: express.Request,
  ): Promise<void> {
    try {
      const { username, password, confirmPassword } = req.body;
      // if (username.trim() === "" || username.includes(" ")) {
      //   res.status(400).json({ message: "Invalid username" });
      //   return;
      // }
      // if (password.trim() === "" || password !== confirmPassword) {
      //   res.status(400).json({ message: "Password mismatch or empty" });
      //   return;
      // }
      this.userService.register(username, password);
    } catch (e) {
      const error = e as Error;
      switch (error.message) {
        case "User with this username already exists": {
          res.status(400).send("User with this username already exists");
          break;
        }
        default: {
          res.status(500).send("Internal server error");
        }
      }
    }
  }

  @Post("/refresh-access-token")
  async refreshAccessToken(
    @Response() res: express.Response,
    @Cookies("refreshToken") oldRefreshToken: string,
  ): Promise<void> {
    console.log("Refresh access token");
    try {
      const { accessToken, refreshToken } =
        await this.userService.refreshAccessToken(oldRefreshToken);
      this.setTokens(accessToken, refreshToken, res);
      res.status(200).json({
        message: "Token refreshed successfully.",
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (e) {
      const error = e as Error;
      switch (error.message) {
        case "Refresh token is missing": {
          res.status(400).send({ message: "Refresh token is not provided" });
          break;
        }
        default: {
          res.status(500).send("Internal server error");
        }
      }
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

  private setTokens(
    accessToken: string,
    refreshToken: string,
    res: express.Response,
  ) {
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
