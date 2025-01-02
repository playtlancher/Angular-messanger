import { Controller, Get, Response } from "@decorators/express";
import UserService from "../services/UserService";
import express from "express";

@Controller("/users")
export default class UserController {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @Get("/")
  async getUsers(@Response() res: express.Response): Promise<void> {
    const users = await this.userService.getUsers();
    res.status(200).send(users);
  }
}
