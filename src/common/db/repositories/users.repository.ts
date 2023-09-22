import { DataSource, Repository } from "typeorm";
import UsersRepositoryType from "../../types/db/repositories/users.repository.type";
import UsersEntity from "../entities/users.entity";

class UsersRepository implements UsersRepositoryType {
  repository: Repository<UsersEntity>;
  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(UsersEntity);
  }

  saveUser(user: UsersEntity) {
    return this.repository.save(user);
  }

  findUser(username: string) {
    return this.repository.findOne({ where: { username } });
  }
}

export default UsersRepository;
