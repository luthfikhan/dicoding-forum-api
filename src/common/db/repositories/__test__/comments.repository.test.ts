import CommentsRepositoryType from "../../../types/db/repositories/comments.repository.type";
import AppDataSource from "../../db.config";
import CommentsEntity from "../../entities/comments.entity";
import CommentsRepository from "../comments.repository";

describe("Comments Repository Test", () => {
  let commentRepository: CommentsRepositoryType;
  const commentId = "comment-id";

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(async () => {
    commentRepository = new CommentsRepository(AppDataSource);
  });

  afterEach(async () => {
    await AppDataSource.getRepository(CommentsEntity).clear();
  });

  test("Save Comment", async () => {
    const data = await commentRepository.saveComment({
      id: commentId,
      content: "Komentar",
    } as CommentsEntity);

    expect(data.date).toBeDefined();
  });

  test("Find Not Found Comment", async () => {
    const data = await commentRepository.findComment("id-x");

    expect(!!data).toBeFalsy();
  });

  test("Find Comment", async () => {
    await commentRepository.saveComment({
      id: commentId,
      content: "Komentar",
    } as CommentsEntity);
    const data = await commentRepository.findComment(commentId);

    expect(data.id).toBeDefined();
  });

  test("Delete Comment", async () => {
    const data = await commentRepository.saveComment({
      id: commentId,
      content: "Comment",
    } as CommentsEntity);

    expect(data.date).toBeDefined();
    await commentRepository.deleteComment(data.id);
    const dataAfterDeletion = await commentRepository.findComment(commentId);
    expect(!!dataAfterDeletion).toBeFalsy();
  });
});
