"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {}
function default_1(sequelize) {
  User.init(
    {
      id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: false,
      },
      password: {
        type: sequelize_1.DataTypes.STRING(75),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: false,
    },
  );
  return User;
}
