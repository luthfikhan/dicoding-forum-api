import { type Plugin, type Request, type ResponseToolkit } from "@hapi/hapi";
import { Repository } from "typeorm";
import AuthenticationsController from "./authentications.controller";
import AuthenticationsService from "./authentications.service";
import AuthenticationsEntity from "../../common/entities/authentications.entity";
import * as Joi from "joi";
import { type RequestLoginType, type RequestLogoutType, type RequestRefreshTokenType } from "./authentications.dto";
import UsersEntity from "../../common/entities/users.entity";

interface PluginOptions {
  authenticationsRepository: Repository<AuthenticationsEntity>;
  usersRepository: Repository<UsersEntity>;
}

const authentications: Plugin<PluginOptions> = {
  name: "api/authentications",
  version: "v1",
  register(server, options) {
    const { authenticationsRepository, usersRepository } = options;

    const authenticationsService = new AuthenticationsService(authenticationsRepository, usersRepository);
    const authenticationsController = new AuthenticationsController(authenticationsService);

    server.route([
      {
        method: "POST",
        path: "/authentications",
        handler: async (request: Request<RequestLoginType>, h: ResponseToolkit) => {
          return await authenticationsController.login(request, h);
        },
        options: {
          auth: false,
          validate: {
            payload: Joi.object({
              username: Joi.string().required(),
              password: Joi.string().required(),
            }),
          },
        },
      },
      {
        method: "PUT",
        path: "/authentications",
        handler: async (request: Request<RequestRefreshTokenType>) => {
          return await authenticationsController.refreshToken(request);
        },
        options: {
          auth: false,
          validate: {
            payload: Joi.object({
              refreshToken: Joi.string().required(),
            }),
          },
        },
      },
      {
        method: "DELETE",
        path: "/authentications",
        handler: async (request: Request<RequestLogoutType>) => {
          return await authenticationsController.logout(request);
        },
        options: {
          auth: false,
          validate: {
            payload: Joi.object({
              refreshToken: Joi.string().required(),
            }),
          },
        },
      },
    ]);
  },
};

export default authentications;
