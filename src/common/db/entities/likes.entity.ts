import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import UsersEntity from "./users.entity";
import CommentsEntity from "./comments.entity";

@Entity("likes")
export class LikesEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => UsersEntity, (user) => user.likes)
  owner: UsersEntity;

  @ManyToOne(() => CommentsEntity, (comment) => comment.likes)
  comment: CommentsEntity;
}

export default LikesEntity;
