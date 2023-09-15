import { Request, ResponseToolkit } from "@hapi/hapi";
import UsersService from "./users.service";
import { AddUserPayload } from "./users.dto";
import { hashPassword } from "../../utils/password-hash";
import { nanoid } from "nanoid";

export default class UsersController {
  constructor(private userService: UsersService) {}

  async addUser(request: Request<AddUserPayload>, h: ResponseToolkit) {
    const { payload } = request;
    payload.username = payload.username.toLowerCase();
    this.userService.validateUsername(payload.username);

    await this.userService.usernameEligibility(payload.username);

    const addedUser = await this.userService.insert({
      username: payload.username,
      fullname: payload.fullname,
      password: hashPassword(payload.password),
      id: `user-${nanoid(40)}`,
    });

    const response = h
      .response({
        status: "success",
        data: {
          addedUser: {
            username: addedUser.username,
            id: addedUser.id,
            fullname: addedUser.fullname,
          },
        },
      })
      .code(201);

    return response;
  }
}
