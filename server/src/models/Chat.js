"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const sequelize_1 = require("sequelize");
class Chat extends sequelize_1.Model {}
function default_1(sequelize) {
  Chat.init(
    {
      id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Chat",
      tableName: "chats",
      timestamps: false,
    },
  );
  return Chat;
}
