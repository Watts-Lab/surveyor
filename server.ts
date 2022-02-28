/** @format */
require("dotenv").config();
import { Server } from "http";
import { create_app } from "./app";
import { env_config } from "./config";
import { start_db_server } from "./databases/db";

export async function start_server(): Promise<Server> {
  start_db_server(env_config)
  const app = await create_app()
  const server = await app.listen(process.env.PORT ? process.env.PORT : 4000, () => {
    console.log(
      `Listening on port ${
        server.address()["port"]
      }\nPreview at http://localhost:${server.address()["port"]}`
    );
  });

  return server;
}

start_server();
