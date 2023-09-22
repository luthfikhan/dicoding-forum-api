import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import ThreadsEntity from "./threads.entity";
import CommentsEntity from "./comments.entity";
import RepliesEntity from "./replies.entity";

@Entity("users")
class UsersEntity {
  @PrimaryColumn("varchar", { length: 50 })
  id: string;

  @Column({ unique: true, type: "text" })
  username: string;

  @Column({ type: "text" })
  password: string;

  @Column({ type: "text" })
  fullname: string;

  @OneToMany(() => ThreadsEntity, (thread) => thread.owner)
  threads: ThreadsEntity[];

  @OneToMany(() => CommentsEntity, (comment) => comment.owner)
  comments: CommentsEntity[];

  @OneToMany(() => RepliesEntity, (replies) => replies.owner)
  replies: RepliesEntity[];
}

export default UsersEntity;
