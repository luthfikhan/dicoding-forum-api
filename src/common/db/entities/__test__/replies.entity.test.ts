import { Repository } from "typeorm";
import AppDataSource from "../../db.config";
import RepliesEntity from "../replies.entity";

describe("RepliesEntity Test", () => {
  let repliesRepository: Repository<RepliesEntity>;

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(async () => {
    repliesRepository = AppDataSource.getRepository(RepliesEntity);
  });

  test("Save Reply", async () => {
    const data = await repliesRepository.save({
      id: "replyid",
      content: "Ini Balasan",
    });

    expect(data.date).toBeDefined();
  });
});
