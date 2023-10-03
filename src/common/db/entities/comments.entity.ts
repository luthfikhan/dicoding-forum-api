import { Entity, Column, CreateDateColumn, ManyToOne, OneToMany, DeleteDateColumn, PrimaryColumn } from "typeorm";
import UsersEntity from "./users.entity";
import { ThreadsEntity } from "./threads.entity";
import RepliesEntity from "./replies.entity";
import LikesEntity from "./likes.entity";

@Entity("comments")
export class CommentsEntity {
  @PrimaryColumn("varchar", { length: 50 })
  id: string;

  @Column({ type: "text" })
  content: string;

  @CreateDateColumn()
  date: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => UsersEntity, (user) => user.comments)
  owner: UsersEntity;

  @ManyToOne(() => ThreadsEntity, (thread) => thread.comments)
  thread: ThreadsEntity;

  @OneToMany(() => RepliesEntity, (reply) => reply.comment)
  replies: RepliesEntity[];

  @OneToMany(() => LikesEntity, (like) => like.comment)
  likes: LikesEntity[];
}

export default CommentsEntity;
