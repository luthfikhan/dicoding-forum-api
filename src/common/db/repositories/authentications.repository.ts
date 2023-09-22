import { DataSource, Repository } from "typeorm";
import AuthenticationsEntity from "../entities/authentications.entity";
import AuthenticationsRepositoryType from "../../../types/repositories/authentications.repository.type";

class AuthenticationsRepository implements AuthenticationsRepositoryType {
  repository: Repository<AuthenticationsEntity>;
  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(AuthenticationsEntity);
  }

  saveAuth(auth: AuthenticationsEntity) {
    return this.repository.save(auth);
  }

  deleteAuth(tokenId: string) {
    return this.repository.delete({ tokenId });
  }

  findAuth(tokenId: string) {
    return this.repository.findOne({ where: { tokenId } });
  }
}

export default AuthenticationsRepository;
