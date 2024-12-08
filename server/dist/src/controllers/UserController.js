var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as userService from "../services/UserService";
function postLogin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield userService.login(req, res, next);
        }
        catch (error) {
            next(error);
        }
    });
}
function postRegistration(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username, password, confirmPassword } = req.body;
        try {
            yield userService.register(username, password, confirmPassword, res);
        }
        catch (error) {
            res.status(500).send("Internal server error");
        }
    });
}
function refreshAccessToken(req, res) {
    userService.refreshAccessToken(req, res);
}
function logout(req, res) {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });
    res.status(200).send("User logged out successfully");
}
export { postLogin, logout, postRegistration, refreshAccessToken };
