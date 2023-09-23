import { type Request, type ResponseToolkit } from "@hapi/hapi";
import type AuthenticationsService from "./authentications.service";
import { type RequestLoginType, type RequestLogoutType, type RequestRefreshTokenType } from "./authentications.dto";

export default class AuthenticationsController {
  constructor(private readonly authenticationsService: AuthenticationsService) {}

  async login(request: Request<RequestLoginType>, h: ResponseToolkit) {
    const { payload } = request;

    const token = await this.authenticationsService.login(payload);

    return h
      .response({
        status: "success",
        data: token,
      })
      .code(201);
  }

  async refreshToken(request: Request<RequestRefreshTokenType>) {
    const newToken = await this.authenticationsService.refreshToken(request.payload.refreshToken);

    return {
      status: "success",
      data: newToken,
    };
  }

  async logout(request: Request<RequestLogoutType>) {
    await this.authenticationsService.logout(request.payload.refreshToken);

    return {
      status: "success",
    };
  }
}
