import { type Repository } from "typeorm";
import AuthenticationsEntity from "../../common/entities/authentications.entity";
import type UsersEntity from "../../common/entities/users.entity";
import BadRequestError from "../../common/exceptions/bad-request";
import { isCorrectPassword } from "../../utils/password-hash";
import { type LoginPayload } from "./authentications.dto";
import UnAuthenticationError from "../../common/exceptions/unauthentication";
import { generateToken, generateTokenId, verifyToken } from "../../utils/token";

export default class AuthenticationsService {
  constructor(
    private readonly authenticationsRepository: Repository<AuthenticationsEntity>,
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async getUserByUsername(username: string) {
    const user = await this.usersRepository.findOne({
      where: {
        username,
      },
    });

    return user;
  }

  async login(payload: LoginPayload) {
    const user = await this.getUserByUsername(payload.username);

    if (!user) {
      throw new BadRequestError("username tidak ditemukan");
    }

    if (!isCorrectPassword(user.password, payload.password)) {
      throw new UnAuthenticationError("Password yang Anda masukan salah!");
    }

    return user;
  }

  async generateToken(username: string) {
    const auth = new AuthenticationsEntity();
    const tokenId = generateTokenId(username);
    auth.tokenId = tokenId;

    await this.authenticationsRepository.save(auth);

    return generateToken({ username, tokenId });
  }

  validateRefreshToken(refreshToken: string) {
    const token = verifyToken(refreshToken, "refresh_token");

    return token;
  }

  async validateTokenId(tokenId: string) {
    return await this.authenticationsRepository.findOne({
      where: {
        tokenId,
      },
    });
  }

  async revokeTokenId(tokenId: string) {
    await this.authenticationsRepository.delete({
      tokenId,
    });
  }
}
