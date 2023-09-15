import { DataSource } from "typeorm";
import UsersEntity from "../entities/users.entity";
import AuthenticationsEntity from "../entities/authentications.entity";
import CommentsEntity from "../entities/comments.entity";
import ThreadsEntity from "../entities/threads.entity";
import RepliesEntity from "../entities/replies.entity";

const type = process.env.DATA_SOURCE_TYPE as "postgres" | "sqlite";

const AppDataSource = new DataSource({
  type,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dropSchema: process.env.NODE_ENV === "test",
  synchronize: true,
  logging: ["error", "warn", "migration"],
  entities: [UsersEntity, AuthenticationsEntity, CommentsEntity, ThreadsEntity, RepliesEntity],
});

export default AppDataSource;
