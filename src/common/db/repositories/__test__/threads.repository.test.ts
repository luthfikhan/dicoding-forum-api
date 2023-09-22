import ThreadsRepositoryType from "../../../../types/repositories/threads.repository.type";
import AppDataSource from "../../db.config";
import ThreadsEntity from "../../entities/threads.entity";
import ThreadsRepository from "../threads.repository";

describe("Threads Repository Test", () => {
  let threadRepository: ThreadsRepositoryType;
  const threadId = "thread-id";
  const threadData = {
    id: threadId,
    title: "Judul",
    body: "Isi",
  };

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(async () => {
    threadRepository = new ThreadsRepository(AppDataSource);
  });

  afterEach(async () => {
    await AppDataSource.getRepository(ThreadsEntity).clear();
  });

  test("Save Thread", async () => {
    const data = await threadRepository.saveThread(threadData as ThreadsEntity);

    expect(data.id).toBeDefined();
  });

  test("Find Not Found Thread", async () => {
    const data = await threadRepository.findThread("threadname-x");

    expect(!!data).toBeFalsy();
  });

  test("Find Thread", async () => {
    await threadRepository.saveThread(threadData as ThreadsEntity);
    const data = await threadRepository.findThread(threadId);

    expect(data.id).toBeDefined();
  });
});
