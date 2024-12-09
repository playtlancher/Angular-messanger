import { Response } from "express";
import DecodedToken from "../interfaces/DecodedToken";
import jwt from "jsonwebtoken";

export default function DecodeJWT(
  token: string,
  res: Response,
): DecodedToken | null {
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    return jwt.verify(token, secret!) as DecodedToken;
  } catch {
    res.status(401).send("Unauthorized");
    return null;
  }
}
