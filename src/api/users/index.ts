import { Plugin, Request, ResponseToolkit } from "@hapi/hapi";
import UsersController from "./users.controller";
import UsersService from "./users.service";
import * as Joi from "joi";
import { RequestAddUserype } from "./users.dto";
import UsersRepositoryType from "../../types/repositories/users.repository.type";

type PluginOptions = {
  usersRepository: UsersRepositoryType;
};

const users: Plugin<PluginOptions> = {
  name: "api/users",
  version: "v1",
  register(server, options) {
    const { usersRepository } = options;
    const usersService = new UsersService(usersRepository);
    const usersController = new UsersController(usersService);

    server.route({
      method: "POST",
      path: "/users",
      handler: (request: Request<RequestAddUserype>, h: ResponseToolkit) => {
        return usersController.addUser(request, h);
      },
      options: {
        auth: false,
        validate: {
          payload: Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required(),
            fullname: Joi.string().required(),
          }),
        },
      },
    });
  },
};

export default users;
