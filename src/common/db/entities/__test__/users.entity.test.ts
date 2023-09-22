import { Repository } from "typeorm";
import AppDataSource from "../../db.config";
import UsersEntity from "../users.entity";

describe("UsersEntity Test", () => {
  let usersRepository: Repository<UsersEntity>;

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(async () => {
    usersRepository = AppDataSource.getRepository(UsersEntity);
  });

  test("Save User", async () => {
    const id = "userid";

    await usersRepository.save({
      id,
      username: "luhfikhan",
      password: "Ini Password",
      fullname: "Luthfi KA",
    });

    const data = await usersRepository.findOne({ where: { id } });

    expect(data.id).toBe(id);
  });
});
