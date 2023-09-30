import { Server, ServerApplicationState } from "@hapi/hapi";
import createServer from "../../../utils/server";
import UsersEntity from "../../../common/db/entities/users.entity";
import AppDataSource from "../../../common/db/db.config";
import UsersRepositoryType from "../../../types/repositories/users.repository.type";
import UsersRepository from "../../../common/db/repositories/users.repository";
import UsersService from "../users.service";

describe("Users Service Test", () => {
  let server: Server<ServerApplicationState>;
  let usersRepository: UsersRepositoryType;
  let userServices: UsersService;

  beforeEach(async () => {
    usersRepository = new UsersRepository(AppDataSource);
    userServices = new UsersService(usersRepository);
    server = await createServer();
    await server.initialize();
  });

  afterEach(async () => {
    await server.stop();
  });

  test("Username contains forbidden char", async () => {
    [" ", "*", "-", "(", ")", "%", "$", "@", "!", "{", "}", "~", "'"].forEach((val) => {
      expect(
        userServices.addUser({
          username: `luthfi${val}khann`,
          fullname: "Luthfi KA",
          password: "followDuluKa",
        }),
      ).rejects.toThrow("tidak dapat membuat user baru karena username mengandung karakter terlarang");
    });
  });

  test("username not available", async () => {
    jest.spyOn(usersRepository, "findUser").mockResolvedValueOnce({ id: "ID" } as UsersEntity);
    expect(
      userServices.addUser({
        username: "luthfikhann",
        fullname: "Luthfi KA",
        password: "followDuluKa",
      }),
    ).rejects.toThrow("username tidak tersedia");
  });

  test("Success Insert User", async () => {
    const username = "luthfikhann";
    const fullname = "Luthfi KA";

    jest.spyOn(usersRepository, "findUser").mockResolvedValueOnce(null);
    jest.spyOn(usersRepository, "saveUser").mockResolvedValueOnce({ id: "ID", username, fullname } as UsersEntity);

    const res = await userServices.addUser({
      username: "luthfikhann",
      fullname: "Luthfi KA",
      password: "followDuluKa",
    });

    expect(res.addedUser).toBeDefined();
    expect(res.addedUser.username).toBe(username);
  });
});
