"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const UserRepository = __importStar(require("../repositories/UserRepository.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function register(username, password1, password2, res) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const isUserExist = yield UserRepository.findAllBy({ username });
      if (isUserExist && isUserExist.length > 0) {
        return res.status(400).send("User with this username already exists");
      }
      if (username.trim() === "") {
        return res.status(400).send("Username is required");
      }
      if (username.includes(" ")) {
        return res.status(400).send("Username should not contain spaces");
      }
      if (password1.trim() === "") {
        return res.status(400).send("Password is required");
      }
      if (password1 !== password2) {
        return res.status(400).send("Passwords do not match");
      }
      yield UserRepository.createUser(username, password1);
      return res.status(200).send("User registered successfully");
    } catch (error) {
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
      const user = yield UserRepository.findOneBy({ username: username });
      if (!user) {
        return res.status(400).json("User not found.");
      }
      const isMatch = yield bcrypt_1.default.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json("Password is wrong");
      }
      const secret = String(process.env.ACCESS_TOKEN_SECRET);
      const payload = { user: { id: user.id, username: user.username } };
      const accessToken = jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: "1h",
      });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      });
      res.status(200).json("User successfully logged in.");
    } catch (error) {
      console.error(error);
      res.status(500).json("Internal server error. Please try again later.");
    }
  });
}
