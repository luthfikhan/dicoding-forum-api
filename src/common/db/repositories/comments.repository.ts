import { DataSource, Repository } from "typeorm";
import CommentsRepositoryType from "../../types/db/repositories/comments.repository.type";
import CommentsEntity from "../entities/comments.entity";

class CommentsRepository implements CommentsRepositoryType {
  repository: Repository<CommentsEntity>;
  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(CommentsEntity);
  }

  saveComment(comment: CommentsEntity) {
    return this.repository.save(comment);
  }

  findComment(id: string) {
    return this.repository.findOne({ where: { id }, relations: ["owner"] });
  }

  deleteComment(id: string) {
    return this.repository.softDelete({ id });
  }
}

export default CommentsRepository;
