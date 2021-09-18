/** @format */
require("dotenv").config();
import express = require("express");
import cors = require("cors");
import { json, urlencoded } from "body-parser";
// import { pick } from "./tools";
import { parseCSV, parseJSON } from "./google_drive";
import { users, surveys, responses, researchers } from "./database";
import fetch from "node-fetch";
import cookieParser = require("cookie-parser");
import session = require("express-session");
import crypto = require('crypto');
import { Request, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";
const app = express();


// IMPORTANT, STORE THESE VARIABLES AS ENV VARIABLE
const crypto_algorithm = 'aes-192-cbc';
const default_researcher = {
  id: 'default',
  iv: '1234567890qwerty',
  pkey: crypto.scryptSync('csslabsurveyor', 'salt', 24)
}

app.use(cors());
app.use(cookieParser());
app.use(
  session({
    secret: "commonsense", // just a long random string
    resave: false,
    saveUninitialized: true,
  })
);

const admin = true;
const required = true;

app.set("view engine", "pug");
app.use(express.static("public")); // More info on this: http://expressjs.com/en/starter/static-files.html
app.use(json()); // for parsing application/json
app.use(urlencoded({ extended: true })); // for parsing url

const listener = app.listen(process.env.PORT ? process.env.PORT : 4000, () => {
  console.log(
    `Listening on port ${
      listener.address()["port"]
    }\nPreview at http://localhost:${listener.address()["port"]}`
  );
});

export const startServer = async () => {};

//for now we will not run with admin == true, so I think we should switch this to a 404 response for the time being and we can deal with other aspects a bit later.
app.get("/", (req, res) => {
  if (admin) {
    res.render("admin", {
      title: "Task robot admin page",
      host: req.headers.host,
    });
  } else res.redirect("/survey");
});

const getsurvey = async (query: string | ParsedQs, req: Request<{}>, res: Response<any>) =>  {
  try {
    const survey_url = new URL(query['url']);
    res.render("survey", {
      query: query,
      survey: await fetch(survey_url)
        .then((response) => response.text())
        .then(parseCSV),
      required: required,
      admin: admin,
      session: req.session.id,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
}
// Test URL: https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv
// e.g. http://localhost:4000/s/?url=https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv&name=Mark
app.get("/s/", async (req, res) => {
  //For debugging purposes. Prints encrypted version of url. In the future, this will be done in researcher menu.
  const cipher = crypto.createCipheriv(crypto_algorithm, default_researcher.pkey, default_researcher.iv);
  let encrypted = cipher.update(JSON.stringify(req.query), 'utf8', 'hex');
  console.log(encrypted += cipher.final('hex'));
  getsurvey(req.query, req, res);
});

//Test Ecryption: http://localhost:4000/e/default/a7259de3588da893baaba3290789571b9d7da56b9893a7fc0a9ee32de938b1acd231164a75d0d54c27a40a211697bab69afbe04a846e6ca545e6585cec5d7b828d941f9e54882c4b2bba80e1c1d8ea054a40535d472745e4be3e090142de487602e60219d7400820245ed62f53d4a078
app.get('/e/:researcherID/:data', async (req, res) => {
  let password : string, iv : string;
  researchers.findOne({id: req.params.researcherID}).then((input_researcher) => {
    let researcher = input_researcher != null ? input_researcher : default_researcher;
    try {
      const decipher = crypto.createDecipheriv(crypto_algorithm, researcher.pkey, researcher.iv);
      let decrypted = decipher.update(req.params.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      getsurvey(JSON.parse(decrypted), req, res);
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  });
});

app.post("/survey", (req, res) => {
  responses.insert(req.body);
  if (admin) {
    res.render("thanks", {
      code: JSON.stringify(req.body, null, 2),
      admin: admin,
    });
  } else res.redirect("/"); // Needs to be updated to deal with multiple page surveys
});

// This needs to be authenticated and to deal with multiple surveys in the future
app.get("/delete/:id", (req, res) => {
  responses.remove({ _id: req.params.id });
  res.redirect("/results");
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
app.get("/results", (req, res) => {
  responses.find().then((all_responses) => {
    const names = Array.from(
      new Set(all_responses.flatMap((r) => Object.keys(r)))
    ).sort();
    res.render("table", { names: names, rows: all_responses, admin: admin });
  });
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
app.get("/results/json", (req, res) => {
  responses.find().then((all_responses) => res.send(all_responses));
});
// };
