/** @format */
require("dotenv").config();
import express = require("express");
import cors = require("cors");
import { json, urlencoded } from "body-parser";
// import { pick } from "./tools";
import { parseCSV, parseJSON } from "./google_drive";

import { users, surveys, responses } from "./test_db";
let mongodb, { MongoClient, collection, ObjectID } = require("mongodb");

import fetch from "node-fetch";
import session = require("express-session");
import crypto = require("crypto");
import { Request, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { env } from "process";
import Mongo from "./prod_db"
import bodyParser = require("body-parser");

const crypto_algorithm = "aes-192-cbc";
//PLACEHOLDER VALUES FOR CRYPTO. DO NOT USE FOR PRODUCTION. Replace "researcherpassword" with researcher"s password.
const private_key_example = crypto.scryptSync("researcherpassword", "salt", 24);
const iv_example = crypto.randomBytes(16);



/* 
  Configuration .env file
*/


// default if .env is missing
let env_config = { PORT: 4000, MONGO: false, URI: '', DB: ''}
let Mongo_Wrapper = null


if(process.env !== undefined){
  env_config = {
    PORT: parseInt(process.env.PORT),
    MONGO: process.env.MONGO.toLowerCase() == 'true' ? true : false,
    URI: process.env.PROD.toLowerCase() == 'true' ? process.env.PROD_URI : process.env.TEST_URI,
    DB: process.env.PROD.toLowerCase() == 'true' ? process.env.PROD_DB : process.env.TEST_DB
  }

  if(env_config.MONGO) {
    let Mongo_Wrapper = new Mongo(env_config.URI)
    Mongo_Wrapper.set_db(env_config.DB)  
  } 
}

/* 
  Setting Up Database 
*/
const app = express();
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
    res.render("survey", {
      query: query,
      survey: await fetch(survey_url)
        .then((response) => response.text())
        .then(parseCSV),
      required: required,
      admin: admin,
      session: req.session.id,
      start_time: Date().toString() 
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
  const cipher = crypto.createCipheriv(crypto_algorithm, private_key_example, iv_example);
  let encrypted = cipher.update(JSON.stringify(req.query), "utf8", "hex");
  console.log(encrypted += cipher.final("hex"));
  console.log(req.query);
  getsurvey(req.query, req, res);
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

app.post("/survey", async (req, res) => {
  req.body["end_time"] =  Date().toString();

  if(!env_config.MONGO){
    responses.insert(req.body);
  } else {
    Mongo_Wrapper.set_collection('responses')
    console.log(req.body)
    await Mongo_Wrapper.insert(req.body)
  }

  if (admin) {
    res.render("thanks", {
      code: JSON.stringify(req.body, null, 2),
      admin: admin,
    });
  } else res.redirect("/"); // Needs to be updated to deal with multiple page surveys
});

// This needs to be authenticated and to deal with multiple surveys in the future
app.get("/delete/:id", async (req, res) => {
  if(!env_config.MONGO){
    responses.remove({ _id: req.params.id });
  } else {
    Mongo_Wrapper.set_collection('responses')
    Mongo_Wrapper.delete(req.params.id)
  }
  res.redirect("/results");
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
app.get("/results", async (req, res) => {
  if(!env_config.MONGO) {
    responses.find().then((all_responses) => {
      const names = Array.from(
        new Set(all_responses.flatMap((r) => Object.keys(r)))
      ).sort();
      res.render("table", { names: names, rows: all_responses, admin: admin });
    });
  } else {
    Mongo_Wrapper.set_collection('responses')
    Mongo_Wrapper.find({})
    .then(
      all_responses => {
        const names = Array.from(
          new Set(all_responses.flatMap((r) => Object.keys(r)))
        )
        .sort();
        res.render("table", { names: names, rows: all_responses, admin: admin });
      }
    )


  }
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
app.get("/results/json", async (req, res) => {
  if(!env_config.MONGO) {
    responses.find()
    .then((all_responses: any) => res.send(all_responses))
  } else {
    Mongo_Wrapper.set_collection('responses')
    Mongo_Wrapper.find({})
    .then(all_responses => {res.send(all_responses)})
  }
});
// };
