import User from "../models/User";
import UserRepository from "../repositories/UserRepository";

export default class UserService {
  userRepository = new UserRepository();
  getUsers(): Promise<User[]> {
    return this.userRepository.findAllBy({});
  }
}
