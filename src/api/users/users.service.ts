import { nanoid } from "nanoid";
import UsersEntity from "../../common/db/entities/users.entity";
import BadRequestError from "../../common/exceptions/bad-request";
import UsersRepositoryType from "../../types/repositories/users.repository.type";
import { hashPassword } from "../../utils/password-hash";
import { AddUserPayload } from "./users.dto";

export default class UsersService {
  constructor(private userRepository: UsersRepositoryType) {}

  async addUser(payload: AddUserPayload) {
    this.validateUsername(payload.username);

    await this.usernameEligibility(payload.username);

    const addedUser = await this.insert({
      username: payload.username,
      fullname: payload.fullname,
      password: hashPassword(payload.password),
      id: `user-${nanoid(40)}`,
    });

    return {
      addedUser: {
        username: addedUser.username,
        id: addedUser.id,
        fullname: addedUser.fullname,
      },
    };
  }

  private validateUsername(username: string) {
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestError("tidak dapat membuat user baru karena username mengandung karakter terlarang");
    }
  }

  private async usernameEligibility(username: string) {
    const user = await this.userRepository.findUser(username);

    if (user) throw new BadRequestError("username tidak tersedia");
  }

  private insert(user: Partial<UsersEntity>) {
    return this.userRepository.saveUser(user);
  }
}
