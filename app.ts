/** @format */
require("dotenv").config();
import { startServer } from "./server";

async function main(): Promise<void> {
  startServer()
}

main();
