import { Repository } from "typeorm";
import UsersEntity from "../../common/entities/users.entity";
import BadRequestError from "../../common/exceptions/bad-request";

export default class UsersService {
  constructor(private userRepository: Repository<UsersEntity>) {}

  validateUsername(username: string) {
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestError("tidak dapat membuat user baru karena username mengandung karakter terlarang");
    }
  }

  async usernameEligibility(username: string) {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
    });

    if (user) throw new BadRequestError("username tidak tersedia");
  }

  insert(user: Partial<UsersEntity>) {
    return this.userRepository.save(user);
  }
}
