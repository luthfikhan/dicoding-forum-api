import { type Plugin, type Request, type ResponseToolkit } from "@hapi/hapi";
import { Repository } from "typeorm";
import ThreadsController from "./threads.controller";
import ThreadsService from "./threads.service";
import ThreadsEntity from "../../common/entities/threads.entity";
import * as Joi from "joi";
import UsersEntity from "../../common/entities/users.entity";
import {
  RequestAddCommentType,
  RequestAddReplyType,
  RequestAddThreadType,
  RequestDeleteCommentType,
  RequestDeleteReplyType,
} from "./threads.dto";
import CommentsEntity from "../../common/entities/comments.entity";
import RepliesEntity from "../../common/entities/replies.entity";

interface PluginOptions {
  threadsRepository: Repository<ThreadsEntity>;
  usersRepository: Repository<UsersEntity>;
  commentsRepository: Repository<CommentsEntity>;
  repliesRepository: Repository<RepliesEntity>;
}

const threads: Plugin<PluginOptions> = {
  name: "api/threads",
  version: "v1",
  register(server, options) {
    const { threadsRepository, usersRepository, commentsRepository, repliesRepository } = options;
    const threadsService = new ThreadsService(
      threadsRepository,
      usersRepository,
      commentsRepository,
      repliesRepository,
    );
    const threadsController = new ThreadsController(threadsService);

    server.route([
      {
        method: "POST",
        path: "/threads",
        handler: async (request: Request<RequestAddThreadType>, h: ResponseToolkit) => {
          return threadsController.createThreads(request, h);
        },
        options: {
          validate: {
            payload: Joi.object({
              title: Joi.string().required(),
              body: Joi.string().required(),
            }),
          },
        },
      },
      {
        method: "POST",
        path: "/threads/{threadId}/comments",
        handler: async (request: Request<RequestAddCommentType>, h: ResponseToolkit) => {
          return threadsController.addComment(request, h);
        },
        options: {
          validate: {
            payload: Joi.object({
              content: Joi.string().required(),
            }),
          },
        },
      },
      {
        method: "DELETE",
        path: "/threads/{threadId}/comments/{commentId}",
        handler: async (request: Request<RequestDeleteCommentType>) => {
          return threadsController.deleteComment(request);
        },
      },
      {
        method: "GET",
        path: "/threads/{threadId}",
        handler: async (request: Request) => {
          return threadsController.getThreadDetail(request);
        },
        options: {
          auth: false,
        },
      },
      {
        method: "POST",
        path: "/threads/{threadId}/comments/{commentId}/replies",
        handler: async (request: Request<RequestAddReplyType>, h: ResponseToolkit) => {
          return threadsController.addReply(request, h);
        },
        options: {
          validate: {
            payload: Joi.object({
              content: Joi.string().required(),
            }),
          },
        },
      },
      {
        method: "DELETE",
        path: "/threads/{threadId}/comments/{commentId}/replies/{replyId}",
        handler: async (request: Request<RequestDeleteReplyType>) => {
          return threadsController.deleteReply(request);
        },
      },
    ]);
  },
};

export default threads;
