var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as UserRepository from "../repositories/UserRepository";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
function register(username, password, confirmPassword, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const isUserExist = yield UserRepository.findAllBy({ username });
            if (isUserExist && isUserExist.length > 0) {
                return res
                    .status(400)
                    .json({ message: "User with this username already exists" });
            }
            if (username.trim() === "") {
                return res.status(400).json({ message: "Username is required" });
            }
            if (username.includes(" ")) {
                return res
                    .status(400)
                    .json({ message: "Username should not contain spaces" });
            }
            if (password.trim() === "") {
                return res.status(400).json({ message: "Password is required" });
            }
            if (password !== confirmPassword) {
                return res.status(400).json({ message: "Passwords do not match" });
            }
            yield UserRepository.createUser(username, password);
            return res.status(200).json({ message: "User registered successfully" });
        }
        catch (error) {
            console.error("Registration error:", error);
            return res
                .status(500)
                .send("Internal server error. Please try again later.");
        }
    });
}
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res
                    .status(400)
                    .json({ message: "Username and password are required." });
            }
            const user = yield UserRepository.findOneBy({ username: username });
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
            const isMatch = yield bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Incorrect password." });
            }
            const secret = process.env.ACCESS_TOKEN_SECRET;
            const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
            if (!secret) {
                return res
                    .status(500)
                    .json({ message: "JWT secret key not configured." });
            }
            const payload = { id: user.id, username: user.username };
            const accessToken = jwt.sign(payload, secret, { expiresIn: "1h" });
            const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600000,
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600000,
            });
            res.status(200).json({
                message: "User successfully logged in.",
                access_token: accessToken,
                refresh_token: refreshToken,
            });
        }
        catch (error) {
            console.error(error);
            res
                .status(500)
                .json({ message: "Internal server error. Please try again later." });
        }
    });
}
function refreshAccessToken(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).send("Refresh token is not provided");
        return;
    }
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    const decoded = jwt.verify(refreshToken, refreshSecret);
    if (decoded) {
        const user = decoded.user;
        const accessToken = jwt.sign(user, secret, { expiresIn: "1h" });
        const refreshToken = jwt.sign(user, refreshSecret, { expiresIn: "7d" });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });
        res.status(200).json({
            message: "Token refreshed successfully.",
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    }
}
export { register, login, refreshAccessToken };
