import { UpdateResult } from "typeorm";
import RepliesEntity from "../../../db/entities/replies.entity";

interface RepliesRepositoryType {
  saveReply: (reply: Partial<RepliesEntity>) => Promise<RepliesEntity>;
  findReply: (id: string) => Promise<RepliesEntity>;
  deleteReply: (id: string) => Promise<UpdateResult>;
}

export default RepliesRepositoryType;
