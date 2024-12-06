import dotenv from "dotenv";
import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Message from "../models/Message";
import ChatUser from "../models/ChatUser";
import Chat from "../models/Chat";

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME as string,
  dialect: "postgres",
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  host: process.env.DB_HOST,
  models: [User, Message, ChatUser, Chat],
});

Message.belongsTo(User, { foreignKey: "from", as: "sender" });

async function init(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    console.log(sequelize.models);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

export { sequelize, init };
