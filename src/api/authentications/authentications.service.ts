import AuthenticationsEntity from "../../common/db/entities/authentications.entity";
import BadRequestError from "../../common/exceptions/bad-request";
import { isCorrectPassword } from "../../utils/password-hash";
import { type LoginPayload } from "./authentications.dto";
import UnAuthenticationError from "../../common/exceptions/unauthentication";
import { generateToken, generateTokenId, verifyToken } from "../../utils/token";
import AuthenticationsRepositoryType from "../../common/types/db/repositories/authentications.repository.type";
import UsersRepositoryType from "../../common/types/db/repositories/users.repository.type";

export default class AuthenticationsService {
  constructor(
    private readonly authenticationsRepository: AuthenticationsRepositoryType,
    private readonly usersRepository: UsersRepositoryType,
  ) {}

  async login(payload: LoginPayload) {
    const user = await this.usersRepository.findUser(payload.username);

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

    await this.authenticationsRepository.saveAuth(auth);

    return generateToken({ username, tokenId });
  }

  validateRefreshToken(refreshToken: string) {
    const token = verifyToken(refreshToken, "refresh_token");

    return token;
  }

  async validateTokenId(tokenId: string) {
    return await this.authenticationsRepository.findAuth(tokenId);
  }

  async revokeTokenId(tokenId: string) {
    await this.authenticationsRepository.deleteAuth(tokenId);
  }
}
