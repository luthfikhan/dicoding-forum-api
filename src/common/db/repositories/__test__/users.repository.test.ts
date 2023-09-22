import UsersRepositoryType from "../../../../types/repositories/users.repository.type";
import AppDataSource from "../../db.config";
import UsersEntity from "../../entities/users.entity";
import UsersRepository from "../users.repository";

describe("Users Repository Test", () => {
  let userRepository: UsersRepositoryType;
  const username = "luthfikhann";
  const userData = {
    id: "user-id",
    username,
    fullname: "Luthfi KA",
    password: "pass",
  };

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(async () => {
    userRepository = new UsersRepository(AppDataSource);
  });

  afterEach(async () => {
    await AppDataSource.getRepository(UsersEntity).clear();
  });

  test("Save User", async () => {
    const data = await userRepository.saveUser(userData as UsersEntity);

    expect(data.id).toBeDefined();
  });

  test("Find Not Found User", async () => {
    const data = await userRepository.findUser("username-x");

    expect(!!data).toBeFalsy();
  });

  test("Find User", async () => {
    await userRepository.saveUser(userData as UsersEntity);
    const data = await userRepository.findUser(username);

    expect(data.id).toBeDefined();
  });
});
