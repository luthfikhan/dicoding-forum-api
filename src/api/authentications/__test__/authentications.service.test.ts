import { Server, ServerApplicationState } from "@hapi/hapi";
import createServer from "../../../utils/server";
import UsersEntity from "../../../common/db/entities/users.entity";
import AppDataSource from "../../../common/db/db.config";
import { hashPassword } from "../../../utils/password-hash";
import AuthenticationsEntity from "../../../common/db/entities/authentications.entity";
import { generateToken, generateTokenId } from "../../../utils/token";
import AuthenticationsService from "../authentications.service";
import UsersRepositoryType from "../../../types/repositories/users.repository.type";
import AuthenticationsRepositoryType from "../../../types/repositories/authentications.repository.type";
import UsersRepository from "../../../common/db/repositories/users.repository";
import AuthenticationsRepository from "../../../common/db/repositories/authentications.repository";

describe("Authentications Service Test", () => {
  let server: Server<ServerApplicationState>;
  let usersRepository: UsersRepositoryType;
  let authenticationsRepository: AuthenticationsRepositoryType;
  let authenticationsService: AuthenticationsService;
  const username = "luthfikhann";

  beforeEach(async () => {
    usersRepository = new UsersRepository(AppDataSource);
    authenticationsRepository = new AuthenticationsRepository(AppDataSource);
    authenticationsService = new AuthenticationsService(authenticationsRepository, usersRepository);
    server = await createServer();
    await server.initialize();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe("Login", () => {
    test("Login - Not yet registered", async () => {
      jest.spyOn(usersRepository, "findUser").mockResolvedValueOnce(null);
      expect(
        async () =>
          await authenticationsService.login({
            username: "Luthfikhann",
            password: "password",
          }),
      ).rejects.toThrow("username tidak ditemukan");
    });

    test("Invalid Password", async () => {
      const currentPass = "pssw0rd!";
      jest.spyOn(usersRepository, "findUser").mockResolvedValueOnce({
        id: "userId",
        username: "luthfikhann",
        password: hashPassword(currentPass),
      } as UsersEntity);
      expect(
        async () =>
          await authenticationsService.login({
            username: "luthfikhann",
            password: "password",
          }),
      ).rejects.toThrow("Password yang Anda masukan salah!");
    });

    test("Login Valid", async () => {
      const currentPass = "pssw0rd!";
      jest.spyOn(usersRepository, "findUser").mockResolvedValueOnce({
        id: "userId",
        username: "luthfikhann",
        password: hashPassword(currentPass),
      } as UsersEntity);
      jest.spyOn(authenticationsRepository, "saveAuth").mockResolvedValueOnce({ id: "ID" } as AuthenticationsEntity);

      const res = await authenticationsService.login({
        username: "luthfikhann",
        password: currentPass,
      });
      expect(res.accessToken).toBeDefined();
      expect(res.refreshToken).toBeDefined();
    });
  });

  describe("Refresh Token", () => {
    test("Invalid Refresh Token", async () => {
      expect(authenticationsService.refreshToken("token")).rejects.toThrow("refresh token tidak valid");
    });

    test("User already logout", async () => {
      jest.spyOn(authenticationsRepository, "findAuth").mockResolvedValueOnce(null);
      const tokenId = generateTokenId(username);
      const token = generateToken({ username, tokenId });

      expect(authenticationsService.refreshToken(token.refreshToken)).rejects.toThrow(
        "refresh token tidak ditemukan di database",
      );
    });

    test("Success Refresh Token", async () => {
      jest.spyOn(authenticationsRepository, "findAuth").mockResolvedValueOnce({ id: "ID" } as AuthenticationsEntity);
      jest.spyOn(authenticationsRepository, "saveAuth").mockResolvedValueOnce({ id: "ID" } as AuthenticationsEntity);
      const tokenId = generateTokenId(username);
      const token = generateToken({ username, tokenId });

      const res = await authenticationsService.refreshToken(token.refreshToken);
      expect(res.accessToken).toBeDefined();
      expect(res.refreshToken).toBeDefined();
    });
  });

  describe("Logout", () => {
    test("Invalid Refresh Token", async () => {
      expect(authenticationsService.logout("token")).rejects.toThrow("refresh token tidak ditemukan di database");
    });

    test("User already logout", async () => {
      jest.spyOn(authenticationsRepository, "findAuth").mockResolvedValueOnce(null);
      const tokenId = generateTokenId(username);
      const token = generateToken({ username, tokenId });

      expect(authenticationsService.logout(token.refreshToken)).rejects.toThrow(
        "refresh token tidak ditemukan di database",
      );
    });

    test("Success Logout", async () => {
      jest.spyOn(authenticationsRepository, "findAuth").mockResolvedValueOnce({ id: "ID" } as AuthenticationsEntity);
      jest.spyOn(authenticationsRepository, "deleteAuth").mockResolvedValueOnce({ raw: { id: "ID" } });
      const tokenId = generateTokenId(username);
      const token = generateToken({ username, tokenId });
      await authenticationsService.logout(token.refreshToken);
      expect.assertions(0);
    });
  });
});
