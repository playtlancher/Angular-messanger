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
exports.getUserChats = getUserChats;
exports.getChatMessages = getChatMessages;
exports.postMessage = postMessage;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ChatUserRepository = __importStar(
  require("../repositories/ChatUserRepository.js"),
);
const ChatRepository = __importStar(require("../repositories/ChatRepository.js"));
const MessageRepository = __importStar(
  require("../repositories/MessageRepository.js"),
);
function getUserChats(req, res) {
  return __awaiter(this, void 0, void 0, function* () {
    const token = checkToken(req);
    if (!token) return res.status(403).send("Unauthorized");
    try {
      const chatIDs = yield ChatUserRepository.findAllBy({
        user_id: token.user.id,
      });
      if (!chatIDs || chatIDs.length === 0) {
        return res.status(404).send("No chats found for this user.");
      }
      const chats = yield Promise.all(
        chatIDs.map((chat) =>
          __awaiter(this, void 0, void 0, function* () {
            const result = yield ChatRepository.findOneBy({ id: chat.chat_id });
            if (!result) {
              throw new Error(`Chat ID ${chat.chat_id} not found`);
            }
            return result;
          }),
        ),
      );
      return res.status(200).json(chats);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send("Internal server error. Please try again later.");
    }
  });
}
function getChatMessages(req, res) {
  return __awaiter(this, void 0, void 0, function* () {
    const chatId = Number(req.params.chat_id);
    const token = checkToken(req);
    if (!token) return res.status(403).send("Unauthorized");
    try {
      if (!(yield checkUserChat(token.user.id, chatId))) {
        return res.status(403).send("User has no access to this chat.");
      }
      const messages = yield MessageRepository.findAllBy({ chat: chatId });
      if (!messages || messages.length === 0) {
        return res.status(404).send("No messages found for this chat.");
      }
      messages.sort((a, b) => a.date.getTime() - b.date.getTime());
      return res.status(200).json(messages);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send("Internal server error. Please try again later.");
    }
  });
}
function postMessage(req, res) {
  return __awaiter(this, void 0, void 0, function* () {
    const chatId = Number(req.params.chat_id);
    const { message } = req.body;
    if (!message || !message.text) {
      return res.status(400).send("Invalid message format.");
    }
    const { text } = message;
    const token = checkToken(req);
    if (!token) return res.status(403).send("Unauthorized");
    try {
      if (!(yield checkUserChat(token.user.id, chatId))) {
        return res.status(403).send("User has no access to this chat.");
      }
      const createdMessage = yield MessageRepository.createMessage(
        text,
        token.user.id,
        chatId,
      );
      if (!createdMessage) {
        return res.status(500).send("Failed to create message.");
      }
      return res.status(201).json(createdMessage);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send("Internal server error. Please try again later.");
    }
  });
}
function checkToken(req) {
  const token = req.cookies.accessToken;
  if (!token) {
    console.warn("Access token is missing.");
    return false;
  }
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      console.error("ACCESS_TOKEN_SECRET is not defined.");
      return false;
    }
    return jsonwebtoken_1.default.verify(token, secret);
  } catch (err) {
    console.error("Invalid token:", err);
    return false;
  }
}
function checkUserChat(userId, chatId) {
  return __awaiter(this, void 0, void 0, function* () {
    const result = yield ChatUserRepository.findAllBy({
      user_id: userId,
      chat_id: chatId,
    });
    return result && result.length > 0;
  });
}
