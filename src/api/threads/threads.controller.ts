import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  RequestAddCommentType,
  RequestAddReplyType,
  RequestAddThreadType,
  RequestDeleteCommentType,
  RequestDeleteReplyType,
  RequestLikeCommentType,
} from "./threads.dto";
import ThreadsService from "./threads.service";

class ThreadsController {
  constructor(private threadsService: ThreadsService) {}

  async createThreads(request: Request<RequestAddThreadType>, h: ResponseToolkit) {
    const username = request.auth.credentials.user.username;

    const thread = await this.threadsService.createThreads(username, request.payload);

    return h
      .response({
        status: "success",
        data: thread,
      })
      .code(201);
  }

  async addComment(request: Request<RequestAddCommentType>, h: ResponseToolkit) {
    const username = request.auth.credentials.user.username;
    const threadId = request.params.threadId;

    const comment = await this.threadsService.createThreadComment(username, threadId, request.payload);

    return h
      .response({
        status: "success",
        data: comment,
      })
      .code(201);
  }

  async deleteComment(request: Request<RequestDeleteCommentType>) {
    const username = request.auth.credentials.user.username;
    const { threadId, commentId } = request.params;

    await this.threadsService.deleteComment(username, threadId, commentId);

    return {
      status: "success",
    };
  }

  async getThreadDetail(request: Request) {
    const threadId = request.params.threadId;
    const thread = await this.threadsService.getDeepThreadDetail(threadId);

    return {
      status: "success",
      data: thread,
    };
  }

  async addReply(request: Request<RequestAddReplyType>, h: ResponseToolkit) {
    const username = request.auth.credentials.user.username;
    const { threadId, commentId } = request.params;

    const reply = await this.threadsService.createCommentReply(username, threadId, commentId, request.payload);

    return h
      .response({
        status: "success",
        data: reply,
      })
      .code(201);
  }

  async deleteReply(request: Request<RequestDeleteReplyType>) {
    const username = request.auth.credentials.user.username;
    const { threadId, commentId, replyId } = request.params;

    await this.threadsService.deleteReply(username, threadId, commentId, replyId);

    return {
      status: "success",
    };
  }

  async addCommentLike(request: Request<RequestLikeCommentType>) {
    const username = request.auth.credentials.user.username;
    const { threadId, commentId } = request.params;

    await this.threadsService.addCommentLike(username, threadId, commentId);

    return {
      status: "success",
    };
  }
}

export default ThreadsController;
