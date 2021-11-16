import {Db_Wrapper, env_config} from "../config"
const express = require('express');
import { parseCSV, parseJSON } from "../google_drive";
import { ParsedQs } from "qs";
import { Request, Response } from "express-serve-static-core";

import { encrypt, decrypt } from "../util"

import fetch from "node-fetch";
import { verifyAdminToken, verifyToken } from "../middlewares/auth.middleware";
import { json } from "body-parser";
const router = express.Router()

const required = true;

router.get("/", verifyAdminToken, (req, res) => {
  res.render("admin", {
    title: "Task robot admin page",
    host: req.headers.host,
  });
});

const getsurvey = async (query: string | ParsedQs, req: Request<{}>, res: Response<any>) =>  {
  try {
    const survey_url = new URL(query["url"]);
    const worker_id = query["WorkerId"]
    res.render("survey", {
      query: query,
      survey: await fetch(survey_url)
        .then((response) => response.text())
        .then(parseCSV),
      required: required,
      admin: req.user ? req.user.admin : false,
      session: req.session.id,
      start_time: Date().toString(),
      worker_id: worker_id
    });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
  }
// Test URL: https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv
// e.g. http://localhost:4000/s/?url=https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv&name=Mark
router.get("/s/", async (req, res) => {
  getsurvey(req.query, req, res);
});

router.get("/se/:encrypted", async (req, res) => {
  // encryption handled by python backend services at endpoint in internal docs (would)
  try {
    const encrypted = req.params.encrypted
    console.log(encrypted)
    const decrypted = decrypt(encrypted)
    console.log(decrypted)
    let parsed = await JSON.parse(decrypted)
    console.log(parsed)
    if (!(parsed.url && parsed.WorkerId )) {
      return res.status(400).send('Wrong URL encrypted. Please Email Researcher')
    }
    getsurvey(parsed, req, res)    
  } catch (error) {
    console.log(error)
    return res.status(400).send('Wrong URL encrypted. Please Email Researcher')
  }

});

router.post("/survey", async (req, res) => {
  req.body["end_time"] =  Date().toString();

  await Db_Wrapper.insert(req.body, "responses");

  if (req.user) {
    res.render("thanks", {
    code: JSON.stringify(req.body, null, 2),
    admin: req.user.admin,
    });
  } else {
    res.render("thanks")
  }
});

router.get("/e/:data", verifyToken, async (req, res) => {
    //in the future, private_key and iv will be obtained through researcher database
    // I think just token verification of researcher logged in should be fine
    try {
      let decrypted = decrypt(req.params.data);
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
router.get("/results", verifyAdminToken, async (req, res) => {
await Db_Wrapper.find({}, "responses")
.then(
  all_responses => {
    const names = Array.from(
      new Set(all_responses.flatMap((r) => Object.keys(r)))
    )
    .sort();
    res.render("table", { names: names, rows: all_responses, admin: req.user ? req.user.admin : false });
  }
)
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
router.get("/results/json", verifyAdminToken, async (req, res) => {
await Db_Wrapper.find({}, "responses")
.then(all_responses => {res.send(all_responses)});
});
  
module.exports = router