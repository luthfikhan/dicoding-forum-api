import "dotenv/config";
import "reflect-metadata";
import AppDataSource from "./common/db/data-source";
import createServer from "./utils/server";

(async () => {
  const [server] = await Promise.all([createServer(), AppDataSource.initialize()]);

  await server.start();
  console.log(`server start at ${server.info.uri}`);
})();
