import { Request, ResponseToolkit } from "@hapi/hapi";
import UsersService from "./users.service";
import { RequestAddUserype } from "./users.dto";

export default class UsersController {
  constructor(private userService: UsersService) {}

  async addUser(request: Request<RequestAddUserype>, h: ResponseToolkit) {
    const addedUser = await this.userService.addUser(request.payload);

    const response = h
      .response({
        status: "success",
        data: addedUser,
      })
      .code(201);

    return response;
  }
}
