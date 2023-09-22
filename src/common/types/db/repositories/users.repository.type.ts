import UsersEntity from "../../../db/entities/users.entity";

interface UsersRepositoryType {
  saveUser: (user: Partial<UsersEntity>) => Promise<UsersEntity>;
  findUser: (username: string) => Promise<UsersEntity>;
}

export default UsersRepositoryType;
