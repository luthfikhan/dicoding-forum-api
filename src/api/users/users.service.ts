import UsersEntity from "../../common/db/entities/users.entity";
import BadRequestError from "../../common/exceptions/bad-request";
import UsersRepositoryType from "../../types/repositories/users.repository.type";

export default class UsersService {
  constructor(private userRepository: UsersRepositoryType) {}

  validateUsername(username: string) {
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestError("tidak dapat membuat user baru karena username mengandung karakter terlarang");
    }
  }

  async usernameEligibility(username: string) {
    const user = await this.userRepository.findUser(username);

    if (user) throw new BadRequestError("username tidak tersedia");
  }

  insert(user: Partial<UsersEntity>) {
    return this.userRepository.saveUser(user);
  }
}
