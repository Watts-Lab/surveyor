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


const crypto_algorithm = "aes-192-cbc";
//PLACEHOLDER VALUES FOR CRYPTO. DO NOT USE FOR PRODUCTION. Replace "researcherpassword" with researcher"s password.
const private_key_example = crypto.scryptSync("researcherpassword", "salt", 24);
const iv_example = crypto.randomBytes(16);

/*
  Setting Up Database
*/
const mongo = true
const test_db_uri = 'mongodb://localhost:27017/test'
const client = new MongoClient(test_db_uri);

async function test_database() {
  try {
    // Connect the client to the server
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to mongodb server");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
test_database().catch(console.dir);


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

  if(!mongo){
    responses.insert(req.body);
  } else {
    await client.connect()
    const database = client.db("testDB")
    const responses = database.collection("responses")
    await responses.insertOne(req.body) 
    console.log('A document was inserted')
    await client.close()
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
  if(!mongo){
    responses.remove({ _id: req.params.id });
  } else {
    await client.connect()
    const database = client.db("testDB")
    const responses = database.collection("responses")
    await responses.deleteOne({ _id: new ObjectID(req.params.id)}) 
    console.log('A document was deleted')
    await client.close()
  }
  res.redirect("/results");
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
app.get("/results", async (req, res) => {
  if(!mongo) {
    responses.find().then((all_responses) => {
      const names = Array.from(
        new Set(all_responses.flatMap((r) => Object.keys(r)))
      ).sort();
      res.render("table", { names: names, rows: all_responses, admin: admin });
    });
  } else {
    await client.connect()
    const database = client.db("testDB")
    const responses = database.collection("responses")
    await responses.find({})
    .toArray()
    .then( all_responses => {
      console.log(all_responses)
      const names = Array.from(
        new Set(all_responses.flatMap((r) => Object.keys(r)))
      )
      .sort();
      res.render("table", { names: names, rows: all_responses, admin: admin });
    }
    )   
    await client.close()
  }
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
app.get("/results/json", async (req, res) => {
  if(!mongo) {
    responses.find()
    .then((all_responses: any) => res.send(all_responses))
  } else {
    await client.connect()
    const database = client.db("testDB")
    const responses = database.collection("responses")
    await responses.find({}).toArray()
    .then((all_responses: any) => res.send(all_responses));
    await client.close()
  }
});
// };
