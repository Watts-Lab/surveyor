/** @format */
require("dotenv").config();
import { startServer } from "./server";

async function main(): Promise<void> {
  // should be updated to Load CSV from URL (we can hard code that URL for now, and can deal with dynamic coding later)
  startServer();
}

main();
