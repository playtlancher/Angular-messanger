"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const sequelize_1 = require("sequelize");
class Message extends sequelize_1.Model {}
function default_1(sequelize) {
  Message.init(
    {
      id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      text: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
      },
      from: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
          model: "User",
          key: "id",
        },
        allowNull: false,
      },
      date: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: false,
      },
      chat: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
          model: "Chat",
          key: "id",
        },
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "messages",
      timestamps: false,
    },
  );
  return Message;
}
