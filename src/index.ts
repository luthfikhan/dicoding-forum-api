import "dotenv/config";
import "reflect-metadata";
import AppDataSource from "./common/db/db.config";
import createServer from "./utils/server";

(async () => {
  const [server] = await Promise.all([createServer(), AppDataSource.initialize()]);

  await server.start();
  console.log(`server start at ${server.info.uri}`);
})();
