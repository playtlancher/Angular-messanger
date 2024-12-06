var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from "bcrypt";
import User from "../models/User";
function createUser(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield User.create({
                username: username,
                password: yield bcrypt.hash(password, 10),
            });
            return user.toJSON();
        }
        catch (e) {
            const errors = e.errors.map((error) => error.message);
            console.log(errors);
            return null;
        }
    });
}
function findAllBy(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield User.findAll({ where: params });
        return users || [];
    });
}
function findOneBy(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User.findOne({ where: params });
        if (user)
            return user.toJSON();
    });
}
export { createUser, findAllBy, findOneBy };
