import {Db_Wrapper, env_config} from "../config"
const express = require('express');
import { parseCSV, parseJSON } from "../google_drive";
import { ParsedQs } from "qs";
import { Request, Response } from "express-serve-static-core";
import crypto = require("crypto");
import fetch from "node-fetch";

const router = express.Router()

const admin = true;
const required = true;
const crypto_algorithm = "aes-192-cbc";
//PLACEHOLDER VALUES FOR CRYPTO. DO NOT USE FOR PRODUCTION. Replace "researcherpassword" with researcher"s password.
const private_key_example = crypto.scryptSync("researcherpassword", "salt", 24);
const iv_example = crypto.randomBytes(16);

router.get("/", (req, res) => {
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
router.get("/s/", async (req, res) => {
  //For debugging purposes. Prints encrypted version of url. In the future, this will be done in researcher menu.
  const cipher = crypto.createCipheriv(crypto_algorithm, private_key_example, iv_example);
  let encrypted = cipher.update(JSON.stringify(req.query), "utf8", "hex");
  console.log(encrypted += cipher.final("hex"));
  console.log(req.query);
  getsurvey(req.query, req, res);
  });

  router.post("/survey", async (req, res) => {
  req.body["end_time"] =  Date().toString();

  await Db_Wrapper.insert(req.body, "responses");

  if (admin) {
      res.render("thanks", {
      code: JSON.stringify(req.body, null, 2),
      admin: admin,
      });
  } else res.redirect("/"); // Needs to be updated to deal with multiple page surveys
});

router.get("/e/:data", async (req, res) => {
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

// This needs to be authenticated and to deal with multiple surveys in the future
router.get("/delete/:id", async (req, res) => {
await Db_Wrapper.delete(req.params.id, "responses");
res.redirect("/results");
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
router.get("/results", async (req, res) => {
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
router.get("/results/json", async (req, res) => {
await Db_Wrapper.find({}, "responses")
.then(all_responses => {res.send(all_responses)});
});
  
module.exports = router