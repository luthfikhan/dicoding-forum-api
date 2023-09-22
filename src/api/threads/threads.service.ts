import { Repository } from "typeorm";
import { AddCommentPayload, AddReplyPayload, AddThreadPayload } from "./threads.dto";
import UsersEntity from "../../common/db/entities/users.entity";
import ThreadsEntity from "../../common/db/entities/threads.entity";
import CommentsEntity from "../../common/db/entities/comments.entity";
import RepliesEntity from "../../common/db/entities/replies.entity";
import NotFoundError from "../../common/exceptions/not-found";
import { nanoid } from "nanoid";
import UnAuthorizationError from "../../common/exceptions/unauthorization";

class ThreadsService {
  constructor(
    private readonly threadsRepository: Repository<ThreadsEntity>,
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly commentsRepository: Repository<CommentsEntity>,
    private readonly repliesRepository: Repository<RepliesEntity>,
  ) {}

  async getUserByUsername(username: string) {
    return await this.usersRepository.findOne({
      where: {
        username,
      },
    });
  }

  async createThreads(username: string, thread: AddThreadPayload) {
    const owner = await this.getUserByUsername(username);

    return await this.threadsRepository.save({
      id: `thread-${nanoid(40)}`,
      body: thread.body,
      title: thread.title,
      owner,
    });
  }

  async getThreadDetail(id: string) {
    return await this.threadsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async createThreadComment(username: string, threadId: string, payload: AddCommentPayload) {
    const user = await this.getUserByUsername(username);
    const thread = await this.getThreadDetail(threadId);

    if (!thread) throw new NotFoundError("Thread tidak ditemukan");

    return await this.commentsRepository.save({
      id: `comment-${nanoid(40)}`,
      content: payload.content,
      owner: user,
      thread,
    });
  }

  async getCommentById(id: string) {
    return await this.commentsRepository.findOne({
      where: {
        id,
      },
      relations: ["owner"],
    });
  }

  async getReplyById(id: string) {
    return await this.repliesRepository.findOne({
      where: {
        id,
      },
      relations: ["owner"],
    });
  }

  async getDeepThreadDetail(id: string) {
    const thread = await this.threadsRepository.findOne({
      withDeleted: true,
      where: {
        id,
      },
      relations: ["owner", "comments", "comments.owner", "comments.replies", "comments.replies.owner"],
    });

    if (!thread) throw new NotFoundError("Thread tidak ditemukan");

    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.owner.username,
      comments: thread.comments
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((comment) => ({
          id: comment.id,
          username: comment.owner.username,
          date: comment.date,
          content: comment.deletedAt ? "**komentar telah dihapus**" : comment.content,
          replies: comment.replies
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((reply) => ({
              id: reply.id,
              content: reply.deletedAt ? "**balasan telah dihapus**" : reply.content,
              date: reply.date,
              username: reply.owner.username,
            })),
        })),
    };
  }

  async deleteComment(username: string, threadId: string, commentId: string) {
    const thread = await this.getThreadDetail(threadId);
    if (!thread) throw new NotFoundError("Thread tidak ditemukan");

    const comment = await this.getCommentById(commentId);
    if (!comment) throw new NotFoundError("Comment tidak ditemukan");

    const user = await this.getUserByUsername(username);

    if (comment.owner.id !== user.id)
      throw new UnAuthorizationError("Anda tidak punya hak untuk menghapus resource ini");

    await this.commentsRepository.softDelete({
      id: commentId,
    });
  }

  async createCommentReply(username: string, threadId: string, commentId: string, payload: AddReplyPayload) {
    const thread = await this.getThreadDetail(threadId);
    if (!thread) throw new NotFoundError("Thread tidak ditemukan");

    const comment = await this.getCommentById(commentId);
    if (!comment) throw new NotFoundError("Comment tidak ditemukan");

    const user = await this.getUserByUsername(username);

    return await this.repliesRepository.save({
      id: `reply-${nanoid(40)}`,
      content: payload.content,
      owner: user,
      comment,
    });
  }

  async deleteReply(username: string, threadId: string, commentId: string, replyId: string) {
    const thread = await this.getThreadDetail(threadId);
    if (!thread) throw new NotFoundError("Thread tidak ditemukan");

    const comment = await this.getCommentById(commentId);
    if (!comment) throw new NotFoundError("Komentar tidak ditemukan");

    const reply = await this.getReplyById(replyId);
    if (!reply) throw new NotFoundError("Balasan tidak ditemukan");

    const user = await this.getUserByUsername(username);

    if (reply.owner.id !== user.id) throw new UnAuthorizationError("Anda tidak punya hak untuk menghapus resource ini");

    await this.repliesRepository.softDelete({
      id: replyId,
    });
  }
}

export default ThreadsService;
