import { UpdateResult } from "typeorm";
import CommentsEntity from "../../common/db/entities/comments.entity";

interface CommentsRepositoryType {
  saveComment: (comment: Partial<CommentsEntity>) => Promise<CommentsEntity>;
  findComment: (id: string) => Promise<CommentsEntity>;
  deleteComment: (id: string) => Promise<UpdateResult>;
}

export default CommentsRepositoryType;
