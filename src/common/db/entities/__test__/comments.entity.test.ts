import { Repository } from "typeorm";
import CommentsEntity from "../comments.entity";
import AppDataSource from "../../db.config";
import UsersEntity from "../users.entity";

describe("CommentsEntity Test", () => {
  let commentsRepository: Repository<CommentsEntity>;
  let usersRepository: Repository<UsersEntity>;
  let user: UsersEntity;

  beforeAll(async () => {
    await AppDataSource.initialize();

    usersRepository = AppDataSource.getRepository(UsersEntity);
    await usersRepository.save({
      id: "user-id",
      username: "luhtifkhan",
      password: "password",
      fullname: "Luthfi KA",
    });

    user = await usersRepository.findOne({ where: { id: "user-id" } });
  });

  beforeEach(async () => {
    commentsRepository = AppDataSource.getRepository(CommentsEntity);
  });

  test("Save Comment", async () => {
    const data = await commentsRepository.save({
      id: "commentid",
      content: "Ini Komentar",
      owner: user,
    });

    expect(data.date).toBeDefined();

    const dataUser = await usersRepository.findOne({ where: { id: user.id }, relations: ["comments"] });

    expect(dataUser.comments).toBeDefined();
    expect(dataUser.comments[0].id).toBe(data.id);
  });

  test("Soft Delete Comment", async () => {
    const data = await commentsRepository.save({
      id: "commentid2",
      content: "Ini Komentar",
      owner: user,
    });

    expect(data.date).toBeDefined();

    await commentsRepository.softDelete({ id: data.id });

    const newComment = await commentsRepository.findOne({ where: { id: data.id }, withDeleted: true });

    expect(newComment.deletedAt).toBeDefined();
    expect(newComment.deletedAt).not.toBeNull();
  });
});
