/** @format */
require("dotenv").config();
// import fetch from "node-fetch";
import { startServer } from "./server";

async function main(): Promise<void> {
  // should be updated to Load CSV from URL (we can hard code that URL for now, and can deal with dynamic coding later)

  // const survey = await fetch(process.env.survey_url)
  // .then((res) => res.text()).then(parseCSV).catch(console.log)
  startServer();
}

main();
