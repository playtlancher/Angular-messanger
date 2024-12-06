"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {}
function default_1(sequelize) {
  User.init(
    {
      user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        allowNull: false,
      },
      chat_id: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
          model: "chats",
          key: "id",
        },
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "chat_users",
      timestamps: false,
    },
  );
  return User;
}
