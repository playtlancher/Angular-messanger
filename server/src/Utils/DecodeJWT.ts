import DecodedToken from "../interfaces/DecodedToken";
import jwt from "jsonwebtoken";

export default function DecodeJWT(token: string): DecodedToken {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  return jwt.verify(token, secret!) as DecodedToken;
}