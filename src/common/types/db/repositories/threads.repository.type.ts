import ThreadsEntity from "../../../db/entities/threads.entity";

interface ThreadsRepositoryType {
  saveThread: (thread: Partial<ThreadsEntity>) => Promise<ThreadsEntity>;
  findThread: (id: string) => Promise<ThreadsEntity>;
}

export default ThreadsRepositoryType;
