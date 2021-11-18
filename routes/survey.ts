import {Db_Wrapper, env_config} from "../config"
const express = require('express');
import { parseCSV, parseJSON } from "../google_drive";
import { ParsedQs } from "qs";
import { Request, Response } from "express-serve-static-core";
import { encrypt, decrypt } from "../util"
import fetch from "node-fetch";
import { verifyAdminToken, verifyToken, existsToken } from "../middlewares/auth.middleware";

const router = express.Router()
/* Adding Csurf protection for the router*/
var csrf = require('csurf')
const csrfProtection = csrf({ cookie: true })

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

    res.render("survey", {
      query: query,
      survey: await fetch(survey_url)
        .then((response) => response.text())
        .then(parseCSV),
      required: required,
      admin: req.user ? req.user.admin : false,
      session: req.session.id,
      start_time: Date().toString(),
    });

  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
  }
// Test URL: https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv
// e.g. http://localhost:4000/s/?url=https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv&name=Mark
router.get("/s/", csrfProtection, async (req, res) => {
  const parsed = req.query
  parsed._csrf = req.csrfToken()
  getsurvey(req.query, req, res)
});

router.get("/se/:encrypted", csrfProtection, async (req, res) => {
  try {
    const encrypted = req.params.encrypted
    const decrypted = decrypt(encrypted)
    const parsed = await JSON.parse(decrypted)
    if (!(parsed.url)) { // only query require is url
      return res.status(400).send('Wrong encryption. No URL is found.')
    }

    parsed._csrf = req.csrfToken()
    getsurvey(parsed, req, res)    
  } catch (error) {
    console.log(error)
    return res.status(400).send('Wrong encryption. No URL is found. Please email researcher.')
  }

});

router.post("/survey", csrfProtection, existsToken, async (req, res) => {
  const response = {"end_time": new Date().toISOString()  ,...req.body} 
  delete response['_csrf']
  await Db_Wrapper.insert(response, "responses");
  if (req.user) {
    res.render("thanks", {
    code: JSON.stringify(response, null, 2),
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