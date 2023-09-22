import { Server, ServerApplicationState } from "@hapi/hapi";
import createServer from "../../../utils/server";
import UsersEntity from "../../../common/db/entities/users.entity";
import AppDataSource from "../../../common/db/db.config";
import ThreadsEntity from "../../../common/db/entities/threads.entity";
import CommentsEntity from "../../../common/db/entities/comments.entity";
import RepliesEntity from "../../../common/db/entities/replies.entity";
import AuthenticationsEntity from "../../../common/db/entities/authentications.entity";
import { generateToken, generateTokenId } from "../../../utils/token";

describe("Threads API Test", () => {
  let server: Server<ServerApplicationState>;
  const usersRepository = AppDataSource.getRepository(UsersEntity);
  const threadsRepository = AppDataSource.getRepository(ThreadsEntity);
  const commentsRepository = AppDataSource.getRepository(CommentsEntity);
  const repliesRepository = AppDataSource.getRepository(RepliesEntity);
  const authenticationsRepository = AppDataSource.getRepository(AuthenticationsEntity);
  const username = "luthfikhann";
  const userId = "user-id";
  const tokenId = generateTokenId(username);
  const token = generateToken({ tokenId, username });
  const headers = { Authorization: `Bearer ${token.accessToken}` };

  beforeEach(async () => {
    jest.spyOn(authenticationsRepository, "findOne").mockResolvedValue({ id: "ID" } as AuthenticationsEntity);
    jest.spyOn(usersRepository, "findOne").mockResolvedValue({ id: userId, username } as UsersEntity);

    server = await createServer();
    await server.initialize();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe("Create Thread", () => {
    test("Without Auth", async () => {
      const res = await server.inject<any>({
        method: "post",
        url: "/threads",
        payload: {},
      });

      expect(res.statusCode).toBe(401);
    });

    test("Revoked token", async () => {
      const spy = jest.spyOn(authenticationsRepository, "findOne").mockResolvedValueOnce(null);
      const res = await server.inject<any>({
        method: "post",
        url: "/threads",
        payload: {},
        headers,
      });

      expect(res.statusCode).toBe(401);
      spy.mockRestore();
    });

    test("Invalid Mandatory Parameter", async () => {
      const res = await server.inject<any>({
        method: "post",
        url: "/threads",
        headers,
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });

    test("Test server error", async () => {
      const title = "Ini Title";
      const body = "Ini Body";

      jest.spyOn(threadsRepository, "save").mockRejectedValueOnce(new Error("error"));

      const res = await server.inject<any>({
        method: "post",
        url: "/threads",
        headers,
        payload: {
          title,
          body,
        },
      });

      expect(res.statusCode).toBe(500);
    });

    test("Success create thread", async () => {
      const title = "Ini Title";
      const body = "Ini Body";

      jest
        .spyOn(threadsRepository, "save")
        .mockResolvedValueOnce({ id: "ID", body, title, owner: { username } } as ThreadsEntity);

      const res = await server.inject<any>({
        method: "post",
        url: "/threads",
        headers,
        payload: {
          title,
          body,
        },
      });

      expect(res.statusCode).toBe(201);
      expect(res.result.data).toBeDefined();
      expect(res.result.data.addedThread).toBeDefined();
      expect(res.result.data.addedThread.title).toBe(title);
    });
  });

  describe("Add comment on thread", () => {
    test("Without Auth", async () => {
      const res = await server.inject<any>({
        method: "post",
        url: "/threads/threadId/comments",
        payload: {},
      });

      expect(res.statusCode).toBe(401);
    });

    test("Invalid Mandatory Parameter", async () => {
      const res = await server.inject<any>({
        method: "post",
        url: "/threads/threadId/comments",
        headers,
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });

    test("thread not found", async () => {
      const content = "Ini Content";

      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce(null);

      const res = await server.inject<any>({
        method: "post",
        url: "/threads/threadId/comments",
        headers,
        payload: {
          content,
        },
      });

      expect(res.statusCode).toBe(404);
      expect(res.result.message).toBe("Thread tidak ditemukan");
    });

    test("Success create comment", async () => {
      const content = "Ini Content";

      jest
        .spyOn(threadsRepository, "findOne")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest
        .spyOn(commentsRepository, "save")
        .mockResolvedValueOnce({ id: "comment-id", content, owner: { username } } as CommentsEntity);

      const res = await server.inject<any>({
        method: "post",
        url: "/threads/threadId/comments",
        headers,
        payload: {
          content,
        },
      });

      expect(res.statusCode).toBe(201);
      expect(res.result.data).toBeDefined();
      expect(res.result.data.addedComment).toBeDefined();
      expect(res.result.data.addedComment.content).toBe(content);
    });
  });

  describe("Delete comment on thread", () => {
    test("Without Auth", async () => {
      const res = await server.inject<any>({
        method: "delete",
        url: "/threads/threadId/comments/commentID",
        payload: {},
      });

      expect(res.statusCode).toBe(401);
    });

    test("thread not found", async () => {
      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce(null);

      const res = await server.inject<any>({
        method: "delete",
        url: "/threads/threadId/comments/commentID",
        headers,
      });

      expect(res.statusCode).toBe(404);
      expect(res.result.message).toBe("Thread tidak ditemukan");
    });

    test("comment not found", async () => {
      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce({ id: "id" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findOne").mockResolvedValueOnce(null);

      const res = await server.inject<any>({
        method: "delete",
        url: "/threads/threadId/comments/commentID",
        headers,
      });

      expect(res.statusCode).toBe(404);
      expect(res.result.message).toBe("Comment tidak ditemukan");
    });

    test("Forbidden - UnAuthorization User", async () => {
      jest
        .spyOn(threadsRepository, "findOne")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findOne").mockResolvedValueOnce({
        id: "comment-id",
        content: "content",
        owner: { username, id: "errorid" },
      } as CommentsEntity);

      const res = await server.inject<any>({
        method: "delete",
        url: "/threads/threadId/comments/commentID",
        headers,
      });

      expect(res.statusCode).toBe(403);
      expect(res.result.status).toBe("fail");
      expect(res.result.message).toBe("Anda tidak punya hak untuk menghapus resource ini");
    });

    test("Success Delete", async () => {
      jest
        .spyOn(threadsRepository, "findOne")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findOne").mockResolvedValueOnce({
        id: "comment-id",
        content: "content",
        owner: { username, id: userId },
      } as CommentsEntity);
      jest.spyOn(commentsRepository, "softDelete").mockResolvedValueOnce({ raw: "ok", generatedMaps: [] });

      const res = await server.inject<any>({
        method: "delete",
        url: "/threads/threadId/comments/commentID",
        headers,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result.status).toBe("success");
    });
  });

  describe("Get thread Detail", () => {
    test("thread not found", async () => {
      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce(null);

      const res = await server.inject<any>({
        method: "get",
        url: "/threads/threadId",
        headers,
      });

      expect(res.statusCode).toBe(404);
      expect(res.result.message).toBe("Thread tidak ditemukan");
    });

    test("Success get thread", async () => {
      const threadId = "thread-id";

      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce({
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

      const res = await server.inject<any>({
        method: "get",
        url: "/threads/threadId",
        headers,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result.data).toBeDefined();
      expect(res.result.data.thread).toBeDefined();
      expect(res.result.data.thread.id).toBe(threadId);
    });

    test("Success get thread - with deleted comment", async () => {
      const threadId = "thread-id";

      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce({
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

      const res = await server.inject<any>({
        method: "get",
        url: "/threads/threadId",
        headers,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result.data).toBeDefined();
      expect(res.result.data.thread).toBeDefined();
      expect(res.result.data.thread.id).toBe(threadId);
      expect(res.result.data.thread.comments[0].content).toBe("**komentar telah dihapus**");
    });

    test("Success get thread - with deleted reply", async () => {
      const threadId = "thread-id";

      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce({
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

      const res = await server.inject<any>({
        method: "get",
        url: "/threads/threadId",
        headers,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result.data).toBeDefined();
      expect(res.result.data.thread).toBeDefined();
      expect(res.result.data.thread.id).toBe(threadId);
      expect(res.result.data.thread.comments[0].replies[0].content).toBe("**balasan telah dihapus**");
    });
  });

  describe("Add reply on comment", () => {
    test("Without Auth", async () => {
      const res = await server.inject<any>({
        method: "post",
        url: "/threads/threadId/comments/commentId/replies",
        payload: {},
      });

      expect(res.statusCode).toBe(401);
    });

    test("Invalid Mandatory Parameter", async () => {
      const res = await server.inject<any>({
        method: "post",
        url: "/threads/threadId/comments/commentId/replies",
        headers,
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });

    test("thread not found", async () => {
      const content = "Ini Content";

      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce(null);

      const res = await server.inject<any>({
        method: "post",
        url: "/threads/threadId/comments/commentId/replies",
        headers,
        payload: {
          content,
        },
      });

      expect(res.statusCode).toBe(404);
      expect(res.result.message).toBe("Thread tidak ditemukan");
    });

    test("comment not found", async () => {
      const content = "Ini Content";

      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce({ id: "ID" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findOne").mockResolvedValueOnce(null);

      const res = await server.inject<any>({
        method: "post",
        url: "/threads/threadId/comments/commentId/replies",
        headers,
        payload: {
          content,
        },
      });

      expect(res.statusCode).toBe(404);
      expect(res.result.message).toBe("Comment tidak ditemukan");
    });

    test("Success create reply", async () => {
      const content = "Ini Content";

      jest
        .spyOn(threadsRepository, "findOne")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findOne").mockResolvedValueOnce({ id: "comment-id" } as CommentsEntity);
      jest
        .spyOn(repliesRepository, "save")
        .mockResolvedValueOnce({ id: "comment-id", content, owner: { username } } as RepliesEntity);

      const res = await server.inject<any>({
        method: "post",
        url: "/threads/threadId/comments/commentId/replies",
        headers,
        payload: {
          content,
        },
      });

      expect(res.statusCode).toBe(201);
      expect(res.result.data).toBeDefined();
      expect(res.result.data.addedReply).toBeDefined();
      expect(res.result.data.addedReply.content).toBe(content);
    });
  });

  describe("Delete reply", () => {
    test("Without Auth", async () => {
      const res = await server.inject<any>({
        method: "delete",
        url: "/threads/threadId/comments/commentId/replies/replyId",
        payload: {},
      });

      expect(res.statusCode).toBe(401);
    });

    test("thread not found", async () => {
      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce(null);

      const res = await server.inject<any>({
        method: "delete",
        url: "/threads/threadId/comments/commentId/replies/replyId",
        headers,
      });

      expect(res.statusCode).toBe(404);
      expect(res.result.message).toBe("Thread tidak ditemukan");
    });

    test("comment not found", async () => {
      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce({ id: "id" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findOne").mockResolvedValueOnce(null);

      const res = await server.inject<any>({
        method: "delete",
        url: "/threads/threadId/comments/commentId/replies/replyId",
        headers,
      });

      expect(res.statusCode).toBe(404);
      expect(res.result.message).toBe("Komentar tidak ditemukan");
    });

    test("reply not found", async () => {
      jest.spyOn(threadsRepository, "findOne").mockResolvedValueOnce({ id: "id" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findOne").mockResolvedValueOnce({ id: "comment-id" } as CommentsEntity);
      jest.spyOn(repliesRepository, "findOne").mockResolvedValueOnce(null);

      const res = await server.inject<any>({
        method: "delete",
        url: "/threads/threadId/comments/commentId/replies/replyId",
        headers,
      });

      expect(res.statusCode).toBe(404);
      expect(res.result.message).toBe("Balasan tidak ditemukan");
    });

    test("Forbidden - UnAuthorization User", async () => {
      jest
        .spyOn(threadsRepository, "findOne")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findOne").mockResolvedValueOnce({
        id: "comment-id",
        content: "content",
      } as CommentsEntity);
      jest.spyOn(repliesRepository, "findOne").mockResolvedValueOnce({
        id: "reply-id",
        content: "content",
        owner: {
          username,
          id: "errorId",
        },
      } as RepliesEntity);

      const res = await server.inject<any>({
        method: "delete",
        url: "/threads/threadId/comments/commentId/replies/replyId",
        headers,
      });

      expect(res.statusCode).toBe(403);
      expect(res.result.status).toBe("fail");
      expect(res.result.message).toBe("Anda tidak punya hak untuk menghapus resource ini");
    });

    test("Success Delete", async () => {
      jest
        .spyOn(threadsRepository, "findOne")
        .mockResolvedValueOnce({ id: "ID", body: "body", title: "title" } as ThreadsEntity);
      jest.spyOn(commentsRepository, "findOne").mockResolvedValueOnce({
        id: "comment-id",
        content: "content",
      } as CommentsEntity);
      jest.spyOn(repliesRepository, "findOne").mockResolvedValueOnce({
        id: "reply-id",
        content: "content",
        owner: {
          username,
          id: userId,
        },
      } as RepliesEntity);
      jest.spyOn(repliesRepository, "softDelete").mockResolvedValueOnce({ raw: "ok", generatedMaps: [] });

      const res = await server.inject<any>({
        method: "delete",
        url: "/threads/threadId/comments/commentId/replies/replyId",
        headers,
      });

      expect(res.statusCode).toBe(200);
      expect(res.result.status).toBe("success");
    });
  });
});
