/** @format */
require("dotenv").config();
import { parseCSV } from "./google_drive";
// import fetch from "node-fetch";
import { startServer } from "./server";
import { readFile } from "fs/promises";

var base_url: string = "https://surveyor.com";
var survey_url : string = "raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv";

var key: string[] = [];
var value: string[] = [];
let i: number = 0;
let ext: string = "";
while(i < key.length){
  ext = ext + key[i] + "=" + value[i];
}

async function main(): Promise<void> {
  // should be updated to Load CSV from URL (we can hard code that URL for now, and can deal with dynamic coding later)

  // const survey = await fetch(process.env.survey_url)
  // .then((res) => res.text()).then(parseCSV).catch(console.log)

  // For local testing, just read the sample file from the directory

  const survey = await readFile(base_url + "/url=" + survey_url + "&" + ext)
    .then((buffer) => buffer.toString())
    .then(parseCSV)
    .catch(console.log);
  startServer(survey);
}

main();
