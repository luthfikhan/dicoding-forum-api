import { Plugin, Request, ResponseToolkit } from "@hapi/hapi";
import { Repository } from "typeorm";
import UsersController from "./users.controller";
import UsersService from "./users.service";
import UsersEntity from "../../common/db/entities/users.entity";
import * as Joi from "joi";
import { AddUserPayload } from "./users.dto";

type PluginOptions = {
  usersRepository: Repository<UsersEntity>;
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
      handler: (request: Request<AddUserPayload>, h: ResponseToolkit) => {
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
