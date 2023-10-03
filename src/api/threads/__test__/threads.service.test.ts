import { Server, ServerApplicationState } from "@hapi/hapi";
import createServer from "../../../utils/server";
import UsersEntity from "../../../common/db/entities/users.entity";
import AppDataSource from "../../../common/db/db.config";
import ThreadsEntity from "../../../common/db/entities/threads.entity";
import CommentsEntity from "../../../common/db/entities/comments.entity";
import RepliesEntity from "../../../common/db/entities/replies.entity";
import AuthenticationsEntity from "../../../common/db/entities/authentications.entity";
import UsersRepository from "../../../common/db/repositories/users.repository";
import ThreadsRepository from "../../../common/db/repositories/threads.repository";
import CommentsRepository from "../../../common/db/repositories/comments.repository";
import RepliesRepository from "../../../common/db/repositories/replies.repository";
import AuthenticationsRepository from "../../../common/db/repositories/authentications.repository";
import ThreadsService from "../threads.service";
import LikesRepository from "../../../common/db/repositories/likes.repository";
import LikesEntity from "../../../common/db/entities/likes.entity";

describe("Threads Service Test", () => {
  let server: Server<ServerApplicationState>;
  const usersRepository = new UsersRepository(AppDataSource);
  const threadsRepository = new ThreadsRepository(AppDataSource);
  const commentsRepository = new CommentsRepository(AppDataSource);
  const repliesRepository = new RepliesRepository(AppDataSource);
  const authenticationsRepository = new AuthenticationsRepository(AppDataSource);
  const likesRepository = new LikesRepository(AppDataSource);
  const threadsService = new ThreadsService(
    threadsRepository,
    usersRepository,
    commentsRepository,
    repliesRepository,
    likesRepository,
  );
  const username = "luthfikhann";
  const userId = "user-id";

  beforeEach(async () => {
    jest.spyOn(authenticationsRepository, "findAuth").mockResolvedValue({ id: "ID" } as AuthenticationsEntity);
    jest.spyOn(usersRepository, "findUser").mockResolvedValue({ id: userId, username } as UsersEntity);

    server = await createServer();
    await server.initialize();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe("Create Thread", () => {
    test("Success create thread", async () => {
      const title = "Ini Title";
      const body = "Ini Body";

      jest
        .spyOn(threadsRepository, "saveThread")
        .mockResolvedValueOnce({ id: "ID", body, title, owner: { username } } as ThreadsEntity);

      const res = await threadsService.createThreads(username, {
        title,
        body,
      });

      expect(res.addedThread).toBeDefined();
      expect(res.addedThread.title).toBe(title);
    });
  });

  describe("Add comment on thread", () => {
    test("thread not found", async () => {
      const content = "Ini Content";

      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce(null);

      expect(threadsService.createThreadComment(username, "id", { content })).rejects.toThrow("Thread tidak ditemukan");
    });

    test("Success create comment", async () => {
      const content = "Ini Content";

      jest
        .spyOn(threadsRepository, "findThread")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest
        .spyOn(commentsRepository, "saveComment")
        .mockResolvedValueOnce({ id: "comment-id", content, owner: { username } } as CommentsEntity);

      const res = await threadsService.createThreadComment(username, "id", { content });

      expect(res.addedComment).toBeDefined();
      expect(res.addedComment.content).toBe(content);
    });
  });

  describe("Delete comment on thread", () => {
    test("thread not found", async () => {
      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce(null);

      expect(threadsService.deleteComment(username, "id", "id")).rejects.toThrow("Thread tidak ditemukan");
    });

    test("comment not found", async () => {
      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce({ id: "id" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce(null);

      expect(threadsService.deleteComment(username, "id", "id")).rejects.toThrow("Comment tidak ditemukan");
    });

    test("Forbidden - UnAuthorization User", async () => {
      jest
        .spyOn(threadsRepository, "findThread")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce({
        id: "comment-id",
        content: "content",
        owner: { username, id: "errorid" },
      } as CommentsEntity);

      expect(threadsService.deleteComment(username, "id", "id")).rejects.toThrow(
        "Anda tidak punya hak untuk menghapus resource ini",
      );
    });

    test("Success Delete", async () => {
      jest
        .spyOn(threadsRepository, "findThread")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce({
        id: "comment-id",
        content: "content",
        owner: { username, id: userId },
      } as CommentsEntity);
      jest.spyOn(commentsRepository, "deleteComment").mockResolvedValueOnce({ raw: "ok", generatedMaps: [] });

      await threadsService.deleteComment(username, "id", "id");
      expect.assertions(0);
    });
  });

  describe("Get thread Detail", () => {
    test("thread not found", async () => {
      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce(null);

      expect(threadsService.getDeepThreadDetail("id")).rejects.toThrow("Thread tidak ditemukan");
    });

    test("Success get thread", async () => {
      const threadId = "thread-id";

      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce({
        id: threadId,
        title: "title-thread",
        body: "body-thread",
        owner: {
          id: userId,
          username,
        },
        comments: [
          {
            id: "comment-id",
            content: "content",
            likes: [],
            date: new Date(),
            owner: {
              id: userId,
              username,
            },
            replies: [
              {
                id: "reply-id",
                content: "content",
                date: new Date(),
                owner: {
                  username,
                },
              },
              {
                id: "reply-id2",
                content: "content",
                date: new Date(Date.now() - 1000 * 60),
                owner: {
                  username,
                },
              },
            ],
          },
          {
            id: "comment-id2",
            likes: [],
            content: "content",
            date: new Date(),
            owner: {
              id: userId,
              username,
            },
            replies: [
              {
                id: "reply-id3",
                content: "content",
                date: new Date(),
                owner: {
                  username,
                },
              },
            ],
          },
        ],
      } as ThreadsEntity);

      const res = await threadsService.getDeepThreadDetail(threadId);

      expect(res.thread).toBeDefined();
      expect(res.thread.id).toBe(threadId);
    });

    test("Success get thread - with deleted comment", async () => {
      const threadId = "thread-id";

      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce({
        id: threadId,
        title: "title-thread",
        body: "body-thread",
        owner: {
          id: userId,
          username,
        },
        comments: [
          {
            id: "comment-id",
            content: "content",
            likes: [],
            date: new Date(),
            deletedAt: new Date(),
            owner: {
              id: userId,
              username,
            },
            replies: [],
          },
        ],
      } as ThreadsEntity);

      const res = await threadsService.getDeepThreadDetail(threadId);

      expect(res.thread).toBeDefined();
      expect(res.thread.id).toBe(threadId);
      expect(res.thread.comments[0].content).toBe("**komentar telah dihapus**");
    });

    test("Success get thread - with deleted reply", async () => {
      const threadId = "thread-id";

      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce({
        id: threadId,
        title: "title-thread",
        body: "body-thread",
        owner: {
          id: userId,
          username,
        },
        comments: [
          {
            id: "comment-id",
            content: "content",
            likes: [],
            date: new Date(),
            owner: {
              id: userId,
              username,
            },
            replies: [
              {
                id: "reply-id",
                content: "content",
                date: new Date(),
                deletedAt: new Date(),
                owner: {
                  username,
                },
              },
            ],
          },
        ],
      } as ThreadsEntity);

      const res = await threadsService.getDeepThreadDetail(threadId);

      expect(res.thread).toBeDefined();
      expect(res.thread.id).toBe(threadId);
      expect(res.thread.comments[0].replies[0].content).toBe("**balasan telah dihapus**");
    });
  });

  describe("Add reply on comment", () => {
    test("thread not found", async () => {
      const content = "Ini Content";

      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce(null);

      expect(threadsService.createCommentReply("id", "id", "id", { content })).rejects.toThrow(
        "Thread tidak ditemukan",
      );
    });

    test("comment not found", async () => {
      const content = "Ini Content";

      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce({ id: "ID" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce(null);

      expect(threadsService.createCommentReply("id", "id", "id", { content })).rejects.toThrow(
        "Comment tidak ditemukan",
      );
    });

    test("Success create reply", async () => {
      const content = "Ini Content";

      jest
        .spyOn(threadsRepository, "findThread")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce({ id: "comment-id" } as CommentsEntity);
      jest
        .spyOn(repliesRepository, "saveReply")
        .mockResolvedValueOnce({ id: "comment-id", content, owner: { username } } as RepliesEntity);

      const res = await threadsService.createCommentReply("id", "id", "id", { content });

      expect(res.addedReply).toBeDefined();
      expect(res.addedReply.content).toBe(content);
    });
  });

  describe("Delete reply", () => {
    test("thread not found", async () => {
      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce(null);

      expect(threadsService.deleteReply(username, "id", "id", "id")).rejects.toThrow("Thread tidak ditemukan");
    });

    test("comment not found", async () => {
      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce({ id: "id" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce(null);

      expect(threadsService.deleteReply(username, "id", "id", "id")).rejects.toThrow("Komentar tidak ditemukan");
    });

    test("reply not found", async () => {
      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce({ id: "id" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce({ id: "comment-id" } as CommentsEntity);
      jest.spyOn(repliesRepository, "findReply").mockResolvedValueOnce(null);

      expect(threadsService.deleteReply(username, "id", "id", "id")).rejects.toThrow("Balasan tidak ditemukan");
    });

    test("Forbidden - UnAuthorization User", async () => {
      jest
        .spyOn(threadsRepository, "findThread")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce({
        id: "comment-id",
        content: "content",
      } as CommentsEntity);
      jest.spyOn(repliesRepository, "findReply").mockResolvedValueOnce({
        id: "reply-id",
        content: "content",
        owner: {
          username,
          id: "errorId",
        },
      } as RepliesEntity);

      expect(threadsService.deleteReply(username, "id", "id", "id")).rejects.toThrow(
        "Anda tidak punya hak untuk menghapus resource ini",
      );
    });

    test("Success Delete", async () => {
      jest
        .spyOn(threadsRepository, "findThread")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce({
        id: "comment-id",
        content: "content",
      } as CommentsEntity);
      jest.spyOn(repliesRepository, "findReply").mockResolvedValueOnce({
        id: "reply-id",
        content: "content",
        owner: {
          username,
          id: userId,
        },
      } as RepliesEntity);
      jest.spyOn(repliesRepository, "deleteReply").mockResolvedValueOnce({ raw: "ok", generatedMaps: [] });

      await threadsService.deleteReply(username, "id", "id", "id");
      expect.assertions(0);
    });
  });

  describe("Add Like on comment", () => {
    test("thread not found", async () => {
      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce(null);

      expect(threadsService.addCommentLike(username, "id", "id")).rejects.toThrow("Thread tidak ditemukan");
    });

    test("comment not found", async () => {
      jest.spyOn(threadsRepository, "findThread").mockResolvedValueOnce({ id: "id" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce(null);

      expect(threadsService.addCommentLike(username, "id", "id")).rejects.toThrow("Komentar tidak ditemukan");
    });

    test("Like", async () => {
      jest
        .spyOn(threadsRepository, "findThread")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce({
        id: "comment-id",
        content: "content",
      } as CommentsEntity);
      jest.spyOn(likesRepository, "findLike").mockResolvedValueOnce(null);
      jest.spyOn(likesRepository, "saveLike").mockResolvedValueOnce({ id: "id" } as LikesEntity);

      await threadsService.addCommentLike(username, "id", "id");
      expect.assertions(0);
    });

    test("Unlike", async () => {
      jest
        .spyOn(threadsRepository, "findThread")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findComment").mockResolvedValueOnce({
        id: "comment-id",
        content: "content",
      } as CommentsEntity);
      jest.spyOn(likesRepository, "findLike").mockResolvedValueOnce({ id: "id" } as LikesEntity);
      jest.spyOn(likesRepository, "deleteLike").mockResolvedValueOnce({ raw: "ok" });

      await threadsService.addCommentLike(username, "id", "id");
      expect.assertions(0);
    });
  });
});
