import UserService from "../services/UserService";
import express from "express";
import { Get, Post, Controller, Response, Request } from "@decorators/express";

@Controller("/")
export default class UserController {
  constructor(private readonly userService: UserService) {
    this.userService = new UserService();
  }

  @Post("/login")
  async postLogin(
    @Response() res: express.Response,
    @Request() req: express.Request,
    next: express.NextFunction,
  ): Promise<unknown> {
    try {
      return this.userService.login(req, res);
    } catch (error) {
      next(error);
    }
  }

  @Post("/registration")
  async postRegistration(
    @Response() res: express.Response,
    @Request() req: express.Request,
  ): Promise<void> {
    try {
      await this.userService.register(req, res);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }

  @Post("/refresh-access-token")
  async refreshAccessToken(
    @Response() res: express.Response,
    @Request() req: express.Request,
  ): Promise<void> {
    await this.userService.refreshAccessToken(req, res);
  }

  @Get("/logout")
  async logout(
    @Response() res: express.Response,
    @Request() req: express.Request,
  ): Promise<void> {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).send("User logged out successfully");
  }

  @Get("/users")
  async getUsers(
    @Response() res: express.Response,
    @Request() req: express.Request,
  ): Promise<void> {
    await this.userService.getUsers(req, res);
  }
}
