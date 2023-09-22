import { Request, Server } from "@hapi/hapi";
import * as jwt from "@hapi/jwt";
import Pino from "pino";
import AppDataSource from "../common/db/db.config";
import users from "../api/users";
import ClientError from "../common/exceptions/client-error";
import authentications from "../api/authentications";
import threads from "../api/threads";
import UnAuthenticationError from "../common/exceptions/unauthentication";
import AuthenticationsEntity from "../common/db/entities/authentications.entity";
import UsersEntity from "../common/db/entities/users.entity";
import ThreadsEntity from "../common/db/entities/threads.entity";
import CommentsEntity from "../common/db/entities/comments.entity";
import RepliesEntity from "../common/db/entities/replies.entity";

const createServer = async () => {
  const server: Server = new Server({
    port: process.env.PORT,
    host: process.env.HOST,
    debug: {
      // request: ["error"],
    },
  });

  const dataSource = AppDataSource;
  const authenticationsRepository = dataSource.getRepository(AuthenticationsEntity);
  const usersRepository = dataSource.getRepository(UsersEntity);
  const threadsRepository = dataSource.getRepository(ThreadsEntity);
  const commentsRepository = dataSource.getRepository(CommentsEntity);
  const repliesRepository = dataSource.getRepository(RepliesEntity);

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

      const id = await authenticationsRepository.findOne({
        where: {
          tokenId: payload.tokenId,
        },
      });

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
