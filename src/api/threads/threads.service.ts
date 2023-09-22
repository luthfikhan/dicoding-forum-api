import { AddCommentPayload, AddReplyPayload, AddThreadPayload } from "./threads.dto";
import NotFoundError from "../../common/exceptions/not-found";
import { nanoid } from "nanoid";
import UnAuthorizationError from "../../common/exceptions/unauthorization";
import UsersRepositoryType from "../../types/repositories/users.repository.type";
import RepliesRepositoryType from "../../types/repositories/replies.repository.type";
import CommentsRepositoryType from "../../types/repositories/comments.repository.type";
import ThreadsRepositoryType from "../../types/repositories/threads.repository.type";

class ThreadsService {
  constructor(
    private readonly threadsRepository: ThreadsRepositoryType,
    private readonly usersRepository: UsersRepositoryType,
    private readonly commentsRepository: CommentsRepositoryType,
    private readonly repliesRepository: RepliesRepositoryType,
  ) {}

  async createThreads(username: string, thread: AddThreadPayload) {
    const owner = await this.usersRepository.findUser(username);

    return await this.threadsRepository.saveThread({
      id: `thread-${nanoid(40)}`,
      body: thread.body,
      title: thread.title,
      owner,
    });
  }

  async createThreadComment(username: string, threadId: string, payload: AddCommentPayload) {
    const user = await this.usersRepository.findUser(username);
    const thread = await this.threadsRepository.findThread(threadId);

    if (!thread) throw new NotFoundError("Thread tidak ditemukan");

    return await this.commentsRepository.saveComment({
      id: `comment-${nanoid(40)}`,
      content: payload.content,
      owner: user,
      thread,
    });
  }

  async getDeepThreadDetail(id: string) {
    const thread = await this.threadsRepository.findThread(id);

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
    const thread = await this.threadsRepository.findThread(threadId);
    if (!thread) throw new NotFoundError("Thread tidak ditemukan");

    const comment = await this.commentsRepository.findComment(commentId);
    if (!comment) throw new NotFoundError("Comment tidak ditemukan");

    const user = await this.usersRepository.findUser(username);

    if (comment.owner.id !== user.id)
      throw new UnAuthorizationError("Anda tidak punya hak untuk menghapus resource ini");

    await this.commentsRepository.deleteComment(commentId);
  }

  async createCommentReply(username: string, threadId: string, commentId: string, payload: AddReplyPayload) {
    const thread = await this.threadsRepository.findThread(threadId);
    if (!thread) throw new NotFoundError("Thread tidak ditemukan");

    const comment = await this.commentsRepository.findComment(commentId);
    if (!comment) throw new NotFoundError("Comment tidak ditemukan");

    const user = await this.usersRepository.findUser(username);

    return await this.repliesRepository.saveReply({
      id: `reply-${nanoid(40)}`,
      content: payload.content,
      owner: user,
      comment,
    });
  }

  async deleteReply(username: string, threadId: string, commentId: string, replyId: string) {
    const thread = await this.threadsRepository.findThread(threadId);
    if (!thread) throw new NotFoundError("Thread tidak ditemukan");

    const comment = await this.commentsRepository.findComment(commentId);
    if (!comment) throw new NotFoundError("Komentar tidak ditemukan");

    const reply = await this.repliesRepository.findReply(replyId);
    if (!reply) throw new NotFoundError("Balasan tidak ditemukan");

    const user = await this.usersRepository.findUser(username);

    if (reply.owner.id !== user.id) throw new UnAuthorizationError("Anda tidak punya hak untuk menghapus resource ini");

    await this.repliesRepository.deleteReply(replyId);
  }
}

export default ThreadsService;
