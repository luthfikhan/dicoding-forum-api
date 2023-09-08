import { Server, Request, ResponseToolkit } from "@hapi/hapi";

const init = async () => {
  const server: Server = new Server({
    port: 3000,
    host: "localhost",
  });
  server.register({
    name: '',
    version: '1',
    register(server, options) {
      
    },
  }, {})
  server.route({
    method: "GET",
    path: "/",
    handler: (request: Request, h: ResponseToolkit) => {
      return "Hello World!";
    },
  });
  await server.start();
  console.log("Server running on %s", server.info.uri);
};
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
init();
