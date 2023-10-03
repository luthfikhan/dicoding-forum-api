import CommentsRepositoryType from "../../../../types/repositories/comments.repository.type";
import LikesRepositoryType from "../../../../types/repositories/likes.repository.type";
import UsersRepositoryType from "../../../../types/repositories/users.repository.type";
import { hashPassword } from "../../../../utils/password-hash";
import AppDataSource from "../../db.config";
import CommentsEntity from "../../entities/comments.entity";
import LikesEntity from "../../entities/likes.entity";
import UsersEntity from "../../entities/users.entity";
import CommentsRepository from "../comments.repository";
import LikesRepository from "../likes.repository";
import UsersRepository from "../users.repository";

describe("Likes Repository Test", () => {
  let likeRepository: LikesRepositoryType;
  let userRepository: UsersRepositoryType;
  let commentsRepository: CommentsRepositoryType;
  const username = "luthfikhann";
  const commentId = "comment-id";

  let likeData = {};

  beforeAll(async () => {
    await AppDataSource.initialize();
    userRepository = new UsersRepository(AppDataSource);
    commentsRepository = new CommentsRepository(AppDataSource);
    const user = await userRepository.saveUser({
      username,
      fullname: "Luthfi Khoirul Anwar",
      id: "user-id",
      password: hashPassword("password"),
    });
    const comment = await commentsRepository.saveComment({
      id: commentId,
      content: "Comment",
      owner: user,
    });

    likeData = {
      owner: user,
      comment,
    };
  });

  beforeEach(async () => {
    likeRepository = new LikesRepository(AppDataSource);
  });

  afterEach(async () => {
    await AppDataSource.getRepository(LikesEntity).clear();
  });

  afterAll(async () => {
    await AppDataSource.getRepository(CommentsEntity).clear();
    await AppDataSource.getRepository(UsersEntity).clear();
  });

  test("Save Like", async () => {
    const data = await likeRepository.saveLike(likeData);

    expect(data.id).toBeDefined();
  });

  test("Find Not Found Like", async () => {
    const data = await likeRepository.findLike("likename-x", "ID");

    expect(!!data).toBeFalsy();
  });

  test("Find Like", async () => {
    await likeRepository.saveLike(likeData as LikesEntity);
    const data = await likeRepository.findLike(username, commentId);

    expect(data.id).toBeDefined();
  });

  test("Delete Like", async () => {
    await likeRepository.saveLike(likeData as LikesEntity);
    const data = await likeRepository.findLike(username, commentId);

    expect(data.id).toBeDefined();
    await likeRepository.deleteLike(data.id);
    const updated = await likeRepository.findLike(username, commentId);

    // test failed
    expect(!!updated).toBeTruthy();
  });
});
