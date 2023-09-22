import { Request, Server } from "@hapi/hapi";
import * as jwt from "@hapi/jwt";
import Pino from "pino";
import AppDataSource from "../common/db/db.config";
import users from "../api/users";
import ClientError from "../common/exceptions/client-error";
import authentications from "../api/authentications";
import threads from "../api/threads";
import UnAuthenticationError from "../common/exceptions/unauthentication";
import AuthenticationsRepository from "../common/db/repositories/authentications.repository";
import UsersRepository from "../common/db/repositories/users.repository";
import RepliesRepository from "../common/db/repositories/replies.repository";
import CommentsRepository from "../common/db/repositories/comments.repository";
import ThreadsRepository from "../common/db/repositories/threads.repository";

const createServer = async () => {
  const server: Server = new Server({
    port: process.env.PORT,
    host: process.env.HOST,
    debug: {
      // request: ["error"],
    },
  });

  const dataSource = AppDataSource;
  const authenticationsRepository = new AuthenticationsRepository(dataSource);
  const usersRepository = new UsersRepository(dataSource);
  const threadsRepository = new ThreadsRepository(dataSource);
  const commentsRepository = new CommentsRepository(dataSource);
  const repliesRepository = new RepliesRepository(dataSource);

  // routes
  await server.register([
    {
      plugin: users,
      options: { usersRepository },
    },
    {
      plugin: authentications,
      options: { authenticationsRepository, usersRepository },
    },
    {
      plugin: threads,
      options: {
        threadsRepository,
        usersRepository,
        commentsRepository,
        repliesRepository,
      },
    },
  ]);

  await server.register(jwt.plugin);
  server.auth.strategy("jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: Number(process.env.ACCCESS_TOKEN_AGE),
      timeSkewSec: 15,
    },
    validate: async (artifacts: any) => {
      const payload = artifacts.decoded.payload;

      const id = await authenticationsRepository.findAuth(payload.tokenId);

      if (!id) throw new UnAuthenticationError("Expired Token");

      return {
        isValid: true,
        credentials: { user: payload },
      };
    },
  });
  server.auth.default("jwt");

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h
          .response({
            status: "fail",
            message: response.message,
          })
          .code(response.statusCode);

        return newResponse;
      }

      if (response.isBoom) {
        const newResponse = h
          .response({
            status: "fail",
            message: response.output.payload.message,
          })
          .code(response.output.statusCode);

        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h
        .response({
          status: "error",
          message: "terjadi kegagalan pada server kami",
        })
        .code(500);
      return newResponse;
    }

    return h.continue;
  });

  server.ext("onPostResponse", (req: Request, h) => {
    const res: any = req.response;
    const pino = Pino();
    pino.info(
      {
        path: req.route.path,
        method: req.method,
        status: res.statusCode,
        timetaken: `${req.info.responded - req.info.received}ms`,
      },
      "Request Info",
    );

    return h.continue;
  });

  return server;
};

export default createServer;
