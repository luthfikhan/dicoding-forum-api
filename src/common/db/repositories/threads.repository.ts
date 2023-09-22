import { DataSource, Repository } from "typeorm";
import ThreadsRepositoryType from "../../types/db/repositories/threads.repository.type";
import ThreadsEntity from "../entities/threads.entity";

class ThreadsRepository implements ThreadsRepositoryType {
  repository: Repository<ThreadsEntity>;
  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(ThreadsEntity);
  }

  saveThread(thread: ThreadsEntity) {
    return this.repository.save(thread);
  }

  findThread(id: string) {
    return this.repository.findOne({
      withDeleted: true,
      where: { id },
      relations: ["owner", "comments", "comments.owner", "comments.replies", "comments.replies.owner"],
    });
  }
}

export default ThreadsRepository;
