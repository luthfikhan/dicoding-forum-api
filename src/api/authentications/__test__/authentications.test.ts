import { Server, ServerApplicationState } from "@hapi/hapi";
import createServer from "../../../utils/server";
import { Repository } from "typeorm";
import UsersEntity from "../../../common/db/entities/users.entity";
import AppDataSource from "../../../common/db/db.config";
import { hashPassword } from "../../../utils/password-hash";
import AuthenticationsEntity from "../../../common/db/entities/authentications.entity";
import { generateToken, generateTokenId } from "../../../utils/token";

describe("Authentications API Test", () => {
  let server: Server<ServerApplicationState>;
  let usersRepository: Repository<UsersEntity>;
  let authenticationsRepository: Repository<AuthenticationsEntity>;
  const username = "luthfikhann";

  beforeEach(async () => {
    usersRepository = AppDataSource.getRepository(UsersEntity);
    authenticationsRepository = AppDataSource.getRepository(AuthenticationsEntity);
    server = await createServer();
    await server.initialize();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe("Login", () => {
    test("Invalid mandatory parameter", async () => {
      const res = await server.inject({
        method: "post",
        url: "/authentications",
        payload: {
          username: "Luthfikhann",
        },
      });
      expect(res.statusCode).toEqual(400);
    });

    test("Login - Not yet registered", async () => {
      jest.spyOn(usersRepository, "findOne").mockResolvedValueOnce(null);

      const res = await server.inject<any>({
        method: "post",
        url: "/authentications",
        payload: {
          username: "Luthfikhann",
          password: "password",
        },
      });
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toBe("username tidak ditemukan");
    });

    test("Invalid Password", async () => {
      const currentPass = "pssw0rd!";
      jest.spyOn(usersRepository, "findOne").mockResolvedValueOnce({
        id: "userId",
        username: "luthfikhann",
        password: hashPassword(currentPass),
      } as UsersEntity);

      const res = await server.inject<any>({
        method: "post",
        url: "/authentications",
        payload: {
          username: "luthfikhann",
          password: "password",
        },
      });
      expect(res.statusCode).toEqual(401);
      expect(res.result.message).toBe("Password yang Anda masukan salah!");
    });

    test("Login Valid", async () => {
      const currentPass = "pssw0rd!";
      jest.spyOn(usersRepository, "findOne").mockResolvedValueOnce({
        id: "userId",
        username: "luthfikhann",
        password: hashPassword(currentPass),
      } as UsersEntity);
      jest.spyOn(authenticationsRepository, "save").mockResolvedValueOnce({ id: "ID" } as AuthenticationsEntity);

      const res = await server.inject<any>({
        method: "post",
        url: "/authentications",
        payload: {
          username: "luthfikhann",
          password: currentPass,
        },
      });
      expect(res.statusCode).toEqual(201);
      expect(res.result.data).toBeDefined();
      expect(res.result.data.accessToken).toBeDefined();
      expect(res.result.data.refreshToken).toBeDefined();
    });
  });

  describe("Refresh Token", () => {
    test("Invalid mandatory parameter", async () => {
      const res = await server.inject({
        method: "put",
        url: "/authentications",
        payload: {},
      });
      expect(res.statusCode).toEqual(400);
    });

    test("Invalid Refresh Token", async () => {
      const res = await server.inject<any>({
        method: "put",
        url: "/authentications",
        payload: {
          refreshToken: "token",
        },
      });
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toBe("refresh token tidak valid");
    });

    test("User already logout", async () => {
      jest.spyOn(authenticationsRepository, "findOne").mockResolvedValueOnce(null);
      const tokenId = generateTokenId(username);
      const token = generateToken({ username, tokenId });

      const res = await server.inject<any>({
        method: "put",
        url: "/authentications",
        payload: {
          refreshToken: token.refreshToken,
        },
      });
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toBe("refresh token tidak ditemukan di database");
    });

    test("Success Refresh Token", async () => {
      jest.spyOn(authenticationsRepository, "findOne").mockResolvedValueOnce({ id: "ID" } as AuthenticationsEntity);
      jest.spyOn(authenticationsRepository, "save").mockResolvedValueOnce({ id: "ID" } as AuthenticationsEntity);
      const tokenId = generateTokenId(username);
      const token = generateToken({ username, tokenId });

      const res = await server.inject<any>({
        method: "put",
        url: "/authentications",
        payload: {
          refreshToken: token.refreshToken,
        },
      });
      expect(res.statusCode).toEqual(200);
      expect(res.result.data).toBeDefined();
      expect(res.result.data.accessToken).toBeDefined();
      expect(res.result.data.refreshToken).toBeDefined();
    });
  });

  describe("Logout", () => {
    test("Invalid mandatory parameter", async () => {
      const res = await server.inject({
        method: "delete",
        url: "/authentications",
        payload: {},
      });
      expect(res.statusCode).toEqual(400);
    });

    test("Invalid Refresh Token", async () => {
      const res = await server.inject<any>({
        method: "delete",
        url: "/authentications",
        payload: {
          refreshToken: "token",
        },
      });
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toBe("refresh token tidak ditemukan di database");
    });

    test("User already logout", async () => {
      jest.spyOn(authenticationsRepository, "findOne").mockResolvedValueOnce(null);
      const tokenId = generateTokenId(username);
      const token = generateToken({ username, tokenId });

      const res = await server.inject<any>({
        method: "delete",
        url: "/authentications",
        payload: {
          refreshToken: token.refreshToken,
        },
      });
      expect(res.statusCode).toEqual(400);
      expect(res.result.message).toBe("refresh token tidak ditemukan di database");
    });

    test("Success Logout", async () => {
      jest.spyOn(authenticationsRepository, "findOne").mockResolvedValueOnce({ id: "ID" } as AuthenticationsEntity);
      jest.spyOn(authenticationsRepository, "delete").mockResolvedValueOnce({ raw: { id: "ID" } });
      const tokenId = generateTokenId(username);
      const token = generateToken({ username, tokenId });

      const res = await server.inject<any>({
        method: "delete",
        url: "/authentications",
        payload: {
          refreshToken: token.refreshToken,
        },
      });
      expect(res.statusCode).toEqual(200);
      expect(res.result.status).toBe("success");
    });
  });
});
