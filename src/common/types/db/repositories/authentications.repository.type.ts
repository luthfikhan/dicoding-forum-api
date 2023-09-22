import { DeleteResult } from "typeorm";
import AuthenticationsEntity from "../../../db/entities/authentications.entity";

interface AuthenticationsRepositoryType {
  saveAuth: (auth: AuthenticationsEntity) => Promise<AuthenticationsEntity>;
  deleteAuth: (tokenId: string) => Promise<DeleteResult>;
  findAuth: (tokenId: string) => Promise<AuthenticationsEntity>;
}

export default AuthenticationsRepositoryType;
