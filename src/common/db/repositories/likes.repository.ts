import { DataSource, Repository } from "typeorm";
import LikesRepositoryType from "../../../types/repositories/likes.repository.type";
import LikesEntity from "../entities/likes.entity";

class LikesRepository implements LikesRepositoryType {
  repository: Repository<LikesEntity>;
  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(LikesEntity);
  }
  saveLike(like: Partial<LikesEntity>) {
    return this.repository.save(like);
  }
  findLike(username: string, commentId: string) {
    return this.repository.findOne({ where: { owner: { username }, comment: { id: commentId } } });
  }
  deleteLike(id: string) {
    return this.repository.delete({ id });
  }
}

export default LikesRepository;
