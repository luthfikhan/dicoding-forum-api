import RepliesRepositoryType from "../../../../types/repositories/replies.repository.type";
import AppDataSource from "../../db.config";
import RepliesEntity from "../../entities/replies.entity";
import RepliesRepository from "../replies.repository";

describe("Replies Repository Test", () => {
  let replyRepository: RepliesRepositoryType;
  const replyId = "reply-id";

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(async () => {
    replyRepository = new RepliesRepository(AppDataSource);
  });

  afterEach(async () => {
    await AppDataSource.getRepository(RepliesEntity).clear();
  });

  test("Save Reply", async () => {
    const data = await replyRepository.saveReply({
      id: replyId,
      content: "Komentar",
    } as RepliesEntity);

    expect(data.date).toBeDefined();
  });

  test("Find Not Found Reply", async () => {
    const data = await replyRepository.findReply("id-x");

    expect(!!data).toBeFalsy();
  });

  test("Find Reply", async () => {
    await replyRepository.saveReply({
      id: replyId,
      content: "Komentar",
    } as RepliesEntity);
    const data = await replyRepository.findReply(replyId);

    expect(data.id).toBeDefined();
  });

  test("Delete Reply", async () => {
    const data = await replyRepository.saveReply({
      id: replyId,
      content: "Reply",
    } as RepliesEntity);

    expect(data.date).toBeDefined();
    await replyRepository.deleteReply(data.id);
    const dataAfterDeletion = await replyRepository.findReply(replyId);
    expect(!!dataAfterDeletion).toBeFalsy();
  });
});
