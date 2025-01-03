import UserRepository from "../repositories/UserRepository";
import User from "../models/User";
import DecodeJWT from "../Utils/DecodeJWT";

export default class UserService {
  private userRepository = new UserRepository();

  async getUsers(): Promise<unknown> {
    const users = await this.userRepository.findAllBy({});
    return users.map(user => {
      const { password, ...userWithoutPassword } = user.dataValues;
      return userWithoutPassword;
    });
  }
  async getCurrentUser(token:string): Promise<User | void> {
    const userId = DecodeJWT(token).id;
    return await this.userRepository.findOneBy({id:userId})
  }
  async updateUserAvatar(userId:number,avatarName:string){
    this.userRepository.updateUser(userId,{avatar:avatarName});
  }
}
