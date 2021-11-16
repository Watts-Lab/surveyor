require("dotenv").config();
import express = require("express");
import cors = require("cors");
var cookieParser = require('cookie-parser')
var csrf = require('csurf')

import { json, urlencoded } from "body-parser";
// import { pick } from "./tools";
import { parseCSV, parseJSON } from "./google_drive";

import { Database_Wrapper } from "./interfaces";
import Nedb from "./databases/test_db";
import Mongo from "./databases/prod_db";

import fetch from "node-fetch";
import session = require("express-session");
import crypto = require("crypto");
import { Request, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { env } from "process";
import bodyParser = require("body-parser");
import { type } from "os";
import { start } from "repl";
const axios = require('axios')

const crypto_algorithm = "aes-192-cbc";
//PLACEHOLDER VALUES FOR CRYPTO. DO NOT USE FOR PRODUCTION. Replace "researcherpassword" with researcher"s password.
const private_key_example = crypto.scryptSync("researcherpassword", "salt", 24);
const iv_example = crypto.randomBytes(16);



/* 
  Configuration .env file
*/


// default if .env is missing
interface env {
  PORT: number,
  MONGO: boolean,
  URI: string,
  DB: string,
  RANDOM: string
}
  
let env_config: env | null = null

// nedb default
let Db_Wrapper: Database_Wrapper = new Nedb();
Db_Wrapper.set_db(null);


if(process.env !== undefined || process.env !== null){
  env_config = {
    PORT: parseInt(process.env.PORT),
    MONGO: process.env.MONGO.toLowerCase() == "true" ? true : false,
    URI: process.env.PROD.toLowerCase() == "true" ? process.env.PROD_URI : process.env.TEST_URI,
    DB: process.env.PROD.toLowerCase() == "true" ? process.env.PROD_DB : process.env.TEST_DB,
    RANDOM: process.env.RANDOM
  };

  if(env_config.MONGO) {
    Db_Wrapper = new Mongo(env_config);
    Db_Wrapper.set_db(env_config.DB);  
  };
}


// Middleware
var csrfProtection = csrf({ cookie: true })

/* 
  Setting Up Database 
*/
const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(cors());
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
    const survey_url = new URL(query["url"]);
    let survey = await fetch(survey_url)
    .then((response) => response.text())
    .then(parseCSV)
    var page = new Boolean(true);
    if (survey.some(elem => elem.hasOwnProperty("page"))) {
      var pagefinal = 0
      survey.forEach((elem) => {
        elem["page"] = Number(elem["page"])
        pagefinal = Math.max(Number(elem["page"]), pagefinal)
      })
    } else{
        page = false;
    }
    var startnumber = 1
    if (req.body["start"]) {
      startnumber = Number(req.body["start"])
    }
    if (page) {
      const curr_page = Number(req.body["page"])
      survey = survey.filter((elem) => elem["page"] == curr_page)
      res.render("survey", {
        query: query,
        survey: survey,
        required: required,
        admin: admin,
        session: req.session.id,
        start_time: Date().toString(), 
        page: curr_page + 1,
        csrfToken: req.body["csrfToken"],
        final: pagefinal,
        check: page,
        start: startnumber,
      });
    } else {
      res.render("survey", {
        query: query,
        survey: survey,
        required: required,
        admin: admin,
        session: req.session.id,
        start_time: Date().toString(),
        csrfToken: req.body["csrfToken"],
        check: page,
        start: 1,
      });
    }
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
}

// Test URL: https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv
// e.g. http://localhost:4000/s/?url=https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv&name=Mark
app.get("/s/", csrfProtection, async (req, res) => {
  //For debugging purposes. Prints encrypted version of url. In the future, this will be done in researcher menu.
  const cipher = crypto.createCipheriv(crypto_algorithm, private_key_example, iv_example);
  let encrypted = cipher.update(JSON.stringify(req.query), "utf8", "hex");
  console.log(encrypted += cipher.final("hex"));
  console.log(req.query);
  // Initial Page Hit
  req.body["page"] = 0
  req.body["csrfToken"] = req.csrfToken()

  getsurvey(req.query, req, res);
});

app.get("/se/:encrypted", async (req, res) => {
  // encryption handled by python backend services at endpoint in internal docs (would)
  let result = await Db_Wrapper.find({'alias': req.params.encrypted}, "survey_links")
  result = result[0]
  const parsed = {"url": result.SurveyUrl, "WorkerId": result.WorkerId}
  getsurvey(parsed, req, res)
});

app.get("/e/:data", async (req, res) => {
  //in the future, private_key and iv will be obtained through researcher database
  try {
    const decipher = crypto.createDecipheriv(crypto_algorithm, private_key_example, iv_example);
    let decrypted = decipher.update(req.params.data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    getsurvey(JSON.parse(decrypted), req, res);
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

app.post("/survey", csrfProtection, async (req, res) => {
  req.body["end_time"] =  Date().toString();
  
  await Db_Wrapper.update(
    {"session": req.session.id}, {$set: {...req.body}}, 
    {upsert: true}, 
     "response"
  )

  if (!req.body["check"] || req.body["page"] == req.body["final"]) {
      res.render("thanks", {
       code: JSON.stringify(req.body, null, 2),
        admin: admin,
      });
  } else {
     req.body["csrfToken"] = req.csrfToken()
     getsurvey({"url": req.body["url"]}, req, res)
  }
});

// This needs to be authenticated and to deal with multiple surveys in the future
app.get("/delete/:id", async (req, res) => {
  await Db_Wrapper.delete(req.params.id, "responses");
  res.redirect("/results");
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
app.get("/results", async (req, res) => {
  await Db_Wrapper.find({}, "responses")
  .then(
    all_responses => {
      const names = Array.from(
        new Set(all_responses.flatMap((r) => Object.keys(r)))
      )
      .sort();
      res.render("table", { names: names, rows: all_responses, admin: admin });
    }
  )
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
app.get("/results/json", async (req, res) => {
  let rID = req.header('rID');
  let clientKey = req.header('clientKey');

  clientKey == null ? 'default' : clientKey; //DO NOT USE IN PRODUCTION DELETE THIS LINE

  /*
  * Model: rID leads to researcher database in the future
  * Researcher database outline:
  * rID --> researcherID that points to the specific researcher
  * clientKey --> client key that the researcher uses to access data
  * privateKey --> server key that we use to verify the clientKey
  */

  try {
    const decipher = crypto.createDecipheriv(crypto_algorithm, private_key_example, iv_example);
    let decrypted = decipher.update(clientKey, "hex", "utf8");
    decrypted += decipher.final("utf8");
    if (decrypted === rID || clientKey == 'default') {
      await Db_Wrapper.find({}, "responses")
        .then(all_responses => {res.send(all_responses)});
    } else {
      throw new Error('ID + Key incorrect');
    }
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

/* THIS NEEDS TO BE AUTHENTICATED TO ADMIN USER
 Since this will be live.
 Current Hacky solution: Post enpoint root with random string 
 because someone not authenticate might
 stumble on to it when authentication is not set up.*/
// Create New Link if it doesn't exist otherwise update
app.post(`/link/${env_config.RANDOM}`, async (req, res) => {
  const { alias, url } = req.body

  // Set old link if it exists to inactive
  // With current logic there can only be one active link
  await Db_Wrapper.update(
    {alias, 'active': true}, {$set: {'active': false, 'end': Date().toString()}}, 
    {}, 
    'links'
  )

  // create new alias if post request has been sent
  // Only active link with this alias
  await Db_Wrapper.insert({alias, url, 'hits': 0, 'active': true, 'start': Date().toString(), 'end': null}, 'links')
  

  res.status(200).send('OK')
})
app.get(`/link/${env_config.RANDOM}/:alias`, async (req, res) => {
  const body = await Db_Wrapper.find({'alias': req.params.alias}, 'links')
  res.status(200).send(body)
})
// Redirection To Mturk URL and increments count number
app.get("/r/:alias", async (req, res) => {
  try { 
    const active = true
    const body = await Db_Wrapper.find({'alias': req.params.alias, active}, 'links')
    let {alias, url, hits} = body[0]
    if (hits === null) {
      hits = 0
    }
    Db_Wrapper.update(
      {alias, active}, 
      {$set: {'hits': hits + 1}},
      {},
      'links'
    )
    res.status(301).redirect(url) 
  } catch(error) {
    res.status(404).send('ALIAS DOES NOT EXIST')
  }

})