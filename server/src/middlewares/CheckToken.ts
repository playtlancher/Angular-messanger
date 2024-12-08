import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function CheckToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.accessToken;
  if (!token) {
    console.warn("Access token is missing.");
    res.status(401).send("Unauthorized");
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    console.error(
      "ACCESS_TOKEN_SECRET is not defined in the environment variables.",
    );
    res.status(500).send("Internal server error.");
  }

  try {
    const decoded = jwt.verify(token, secret!);
    next();
  } catch (err) {
    console.error("Invalid token:", err);
    res.status(401).send("Unauthorized");
  }
}
