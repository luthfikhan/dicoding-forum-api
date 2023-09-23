import * as path from "path";
import { config } from "dotenv";
config({ path: path.join(__dirname, process.env.NODE_ENV === "production" ? "../.env.production" : "../.env") });

import "reflect-metadata";
import AppDataSource from "./common/db/db.config";
import createServer from "./utils/server";

(async () => {
  const [server] = await Promise.all([createServer(), AppDataSource.initialize()]);

  await server.start();
  console.log(`server start at ${server.info.uri}`);
})();
