import { DeleteResult } from "typeorm";
import LikesEntity from "../../common/db/entities/likes.entity";

interface LikesRepositoryType {
  saveLike: (like: Partial<LikesEntity>) => Promise<LikesEntity>;
  findLike: (username: string, commentId: string) => Promise<LikesEntity>;
  deleteLike: (id: string) => Promise<DeleteResult>;
}

export default LikesRepositoryType;
