import { Repository } from "typeorm";
import AppDataSource from "../../db/data-source";
import ThreadsEntity from "../threads.entity";

describe("ThreadsEntity Test", () => {
  let threadsRepository: Repository<ThreadsEntity>;

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(async () => {
    threadsRepository = AppDataSource.getRepository(ThreadsEntity);
  });

  test("Save Thread", async () => {
    const data = await threadsRepository.save({
      id: "threadid",
      title: "Ini Judul Thread",
      body: "Ini body",
    });

    expect(data.date).toBeDefined();
  });
});
