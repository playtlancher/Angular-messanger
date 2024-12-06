"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatUser =
  exports.Message =
  exports.Chat =
  exports.User =
  exports.sequelize =
    void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = require("sequelize");
const User_1 = __importDefault(require("../models/User.js"));
const Message_1 = __importDefault(require("../models/Message.js"));
const ChatUser_1 = __importDefault(require("../models/ChatUser.js"));
const Chat_1 = __importDefault(require("../models/Chat.js"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: "postgres",
    host: process.env.DB_HOST,
  },
);
exports.sequelize = sequelize;
const User = (0, User_1.default)(sequelize);
exports.User = User;
const Message = (0, Message_1.default)(sequelize);
exports.Message = Message;
const ChatUser = (0, ChatUser_1.default)(sequelize);
exports.ChatUser = ChatUser;
const Chat = (0, Chat_1.default)(sequelize);
exports.Chat = Chat;
Message.belongsTo(User, { foreignKey: "from", as: "sender" });
