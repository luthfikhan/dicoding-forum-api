import { type Request, type ResponseToolkit } from "@hapi/hapi";
import type AuthenticationsService from "./authentications.service";
import { type RequestLoginType, type RequestLogoutType, type RequestRefreshTokenType } from "./authentications.dto";
import BadRequestError from "../../common/exceptions/bad-request";

export default class AuthenticationsController {
  constructor(private readonly authenticationsService: AuthenticationsService) {}

  async login(request: Request<RequestLoginType>, h: ResponseToolkit) {
    const { payload } = request;

    const user = await this.authenticationsService.login(payload);
    const token = await this.authenticationsService.generateToken(user.username);

    return h
      .response({
        status: "success",
        data: token,
      })
      .code(201);
  }

  async refreshToken(request: Request<RequestRefreshTokenType>) {
    const token = this.authenticationsService.validateRefreshToken(request.payload.refreshToken);
    if (!token) throw new BadRequestError("refresh token tidak valid");

    const tokenId = await this.authenticationsService.validateTokenId(token.tokenId);
    if (!tokenId) throw new BadRequestError("refresh token tidak ditemukan di database");

    const newToken = await this.authenticationsService.generateToken(token.username);

    return {
      status: "success",
      data: newToken,
    };
  }

  async logout(request: Request<RequestLogoutType>) {
    const token = this.authenticationsService.validateRefreshToken(request.payload.refreshToken);
    if (!token) throw new BadRequestError("refresh token tidak ditemukan di database");

    const tokenId = await this.authenticationsService.validateTokenId(token.tokenId);
    if (!tokenId) throw new BadRequestError("refresh token tidak ditemukan di database");

    await this.authenticationsService.revokeTokenId(token.tokenId);

    return {
      status: "success",
    };
  }
}
