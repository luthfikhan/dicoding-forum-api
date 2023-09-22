import { DataSource, Repository } from "typeorm";
import RepliesRepositoryType from "../../../types/repositories/replies.repository.type";
import RepliesEntity from "../entities/replies.entity";

class RepliesRepository implements RepliesRepositoryType {
  repository: Repository<RepliesEntity>;
  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(RepliesEntity);
  }

  saveReply(reply: RepliesEntity) {
    return this.repository.save(reply);
  }

  findReply(id: string) {
    return this.repository.findOne({ where: { id }, relations: ["owner"] });
  }

  deleteReply(id: string) {
    return this.repository.softDelete({ id });
  }
}

export default RepliesRepository;
