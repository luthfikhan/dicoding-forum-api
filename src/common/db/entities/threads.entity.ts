import { Entity, Column, ManyToOne, OneToMany, PrimaryColumn, CreateDateColumn } from "typeorm";
import UsersEntity from "./users.entity";
import CommentsEntity from "./comments.entity";

@Entity("threads")
export class ThreadsEntity {
  @PrimaryColumn("varchar", { length: 50 })
  id: string;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  body: string;

  @CreateDateColumn()
  date: Date;

  @ManyToOne(() => UsersEntity, (user) => user.threads)
  owner: UsersEntity;

  @OneToMany(() => CommentsEntity, (comment) => comment.thread)
  comments: CommentsEntity[];
}

export default ThreadsEntity;
