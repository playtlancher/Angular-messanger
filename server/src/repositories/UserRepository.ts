import bcrypt from "bcrypt";
import { WhereOptions } from "sequelize";
import User from "../models/User";

async function createUser(
  username: string,
  password: string,
): Promise<User | null> {
  try {
    const user = await User.create({
      username: username,
      password: await bcrypt.hash(password, 10),
    });
    return user.toJSON();
  } catch (e: any) {
    const errors = e.errors.map((error: any) => error.message);
    console.log(errors);
    return null;
  }
}

async function findAllBy(params: WhereOptions): Promise<User[]> {
  const users = await User.findAll({ where: params });
  return users || [];
}

async function findOneBy(params: WhereOptions): Promise<User | void> {
  const user = await User.findOne({ where: params });
  if (user) return user.toJSON();
}

export { createUser, findAllBy, findOneBy };
