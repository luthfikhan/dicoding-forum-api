import { Entity, Column, ManyToOne, CreateDateColumn, PrimaryColumn, DeleteDateColumn } from "typeorm";
import UsersEntity from "./users.entity";
import CommentsEntity from "./comments.entity";

@Entity("replies")
class RepliesEntity {
  @PrimaryColumn("varchar", { length: 50 })
  id: string;

  @Column({ type: "text" })
  content: string;

  @CreateDateColumn()
  date: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => UsersEntity, (user) => user.replies)
  owner: UsersEntity;

  @ManyToOne(() => CommentsEntity, (comment) => comment.replies)
  comment: CommentsEntity;
}

export default RepliesEntity;
