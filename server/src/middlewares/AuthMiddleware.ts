import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const allowedEndpoints = ["/login", "/registration", "/refresh_token"];

export function checkAccessToken(req: Request, res: Response, next: NextFunction) {
  if (allowedEndpoints.includes(req.path) || req.method === "OPTIONS") {
    next();
    return;
  }

  const token = req.cookies.accessToken;
  if (!token) {
    console.warn("Access token is missing.");
    res.status(401).send("Unauthorized");
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    console.error("ACCESS_TOKEN_SECRET is not defined in the environment variables.");
    res.status(500).send("Internal server error.");
  }

  try {
    jwt.verify(token, secret!);
    next();
  } catch (err) {
    console.error("Invalid token:", err);
    res.status(401).send("Unauthorized");
  }
}
