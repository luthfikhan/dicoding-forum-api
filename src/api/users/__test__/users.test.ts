import { Server, ServerApplicationState } from "@hapi/hapi";
import createServer from "../../../utils/server";
import { Repository } from "typeorm";
import UsersEntity from "../../../common/entities/users.entity";
import AppDataSource from "../../../common/db/data-source";

describe("Users API Test", () => {
  let server: Server<ServerApplicationState>;
  let usersRepository: Repository<UsersEntity>;

  beforeEach(async () => {
    usersRepository = AppDataSource.getRepository(UsersEntity);
    server = await createServer();
    await server.initialize();
  });

  afterEach(async () => {
    await server.stop();
  });

  test("Invalid Mandatory Parameter", async () => {
    const res = await server.inject<any>({
      method: "post",
      url: "/users",
      payload: {},
    });

    expect(res.statusCode).toBe(400);
  });

  test("Username contains forbidden char", async () => {
    const res = await server.inject<any>({
      method: "post",
      url: "/users",
      payload: {
        username: "luthfi-khan",
        fullname: "Luthfi KA",
        password: "followDuluKa",
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.result.message).toBe("tidak dapat membuat user baru karena username mengandung karakter terlarang");
  });

  test("username not available", async () => {
    jest.spyOn(usersRepository, "findOne").mockResolvedValueOnce({ id: "ID" } as UsersEntity);

    const res = await server.inject<any>({
      method: "post",
      url: "/users",
      payload: {
        username: "luthfikhann",
        fullname: "Luthfi KA",
        password: "followDuluKa",
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.result.message).toBe("username tidak tersedia");
  });

  test("Success Insert User", async () => {
    const username = "luthfikhann";
    const fullname = "Luthfi KA";

    jest.spyOn(usersRepository, "findOne").mockResolvedValueOnce(null);
    jest.spyOn(usersRepository, "save").mockResolvedValueOnce({ id: "ID", username, fullname } as UsersEntity);

    const res = await server.inject<any>({
      method: "post",
      url: "/users",
      payload: {
        username,
        fullname,
        password: "followDuluKa",
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.result.data).toBeDefined();
    expect(res.result.data.addedUser).toBeDefined();
    expect(res.result.data.addedUser.username).toBe(username);
  });
});
