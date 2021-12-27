import {Db_Wrapper, env_config} from "../config"
const express = require("express");
import { parseCSV, parseJSON } from "../google_drive";
import { ParsedQs } from "qs";
import { Request, Response } from "express-serve-static-core";
// helpers
import { encrypt, decrypt } from "../helpers/encrypt_utils"
import { 
  setPageNums, setSurveyResponse, 
  setSurveyCompleted, isSurveyCompleted, 
} from "../helpers/survey_helpers";

import fetch from "node-fetch";
import { verify_admin_token, verify_token, exists_token  } from "../middlewares/auth.middleware";



const router = express.Router()
/* Adding Csurf protection for the router*/
var csrf = require("csurf")
const csrfProtection = csrf({ cookie: true })

const required = true;

router.get("/", verify_admin_token, (req, res) => {
  res.render("admin", {
    title: "Task robot admin page",
    host: req.headers.host,
  });
});

const getMultipageSurvey = (query: string | ParsedQs, req: Request<{}>, res: Response<any>, survey, page, pagefinal, ) => {
  const curr_page = Number(query["curr_page"])
  survey = survey.filter((elem) => elem["page"] === curr_page)
  query["curr_page"] = curr_page + 1

  let startnumber = 1
  if (req.body["start"]) {
    startnumber = Number(req.body["start"])
  }

  res.render("survey", {
    query: query,
    survey: survey,
    required: required,
    admin: req.user ? req.user.admin : false,
    session: req.session.id,
    final: pagefinal,
    check: page,
    start: startnumber,
  })
}

const getSinglepageSurvey = (query, req, res, survey) => {
  res.render("survey", {
    query: query,
    survey: survey,
    required: required,
    admin: req.user ? req.user.admin : false,
    session: req.session.id,
    check: false,
    start: 1,
  });
}

const getsurvey = async (query: string | ParsedQs, req: Request<{}>, res: Response<any>) =>  {
  try {
    const survey_url = new URL(query["url"]);
    let survey = await fetch(survey_url)
    .then((response) => response.text())
    .then(parseCSV)

    let page = new Boolean(true);
    
    if (survey.some(elem => elem.hasOwnProperty("page"))) {
      var pagefinal = setPageNums(survey)
    } else{
      page = false;
    }

    if (page) {
      getMultipageSurvey(query, req, res, survey, page, pagefinal)
    } else {
      getSinglepageSurvey(query, req, res, survey)
    }

  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
}
  // Test URL: https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv
// e.g. http://localhost:4000/s/?url=https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv&name=Mark
router.get("/s/", csrfProtection, async (req, res) => {
  let parsed = undefined
  if(req.session.query) {
    parsed = req.session.query
    delete req.session["query"]
  } else {
    parsed = req.query
  }

  parsed._csrf = req.csrfToken()
  parsed.curr_page = 0
  parsed.start_time = new Date().toISOString() 
  getsurvey(parsed, req, res)
});



router.get("/sa/:alias/", csrfProtection, async (req, res: Response) => {
  const alias = req.params.alias

  if (alias == null) {
    return res.status(400).send('Invalid URL. Please Email Researcher for url')
  }
  
  const record = await Db_Wrapper.find({alias}, "survey_links")

  if (record.length == 0) {
    return res.status(400).send('Invalid URL. Please Email Researcher for url')
  }

  const parsed = record[0]

  if (parsed.status == 'inactive') {
    return res.status(400).send("URL has expired.")
  }

  const validations = ["captcha"]
  parsed.validations = validations
  parsed._csrf = req.csrfToken()
  // meta data deleted
  delete parsed['status']
  delete parsed['creation_date']

  req.session.query = parsed
  
  if (validations.length == 0) {  
    res.redirect("/s")
  } else {
    res.redirect("/validate")
  }
})

router.get("/se/:encrypted", csrfProtection, async (req, res) => {
  try {
    const encrypted = req.params.encrypted
    const decrypted = decrypt(encrypted)
    const parsed = await JSON.parse(decrypted)
    
    // queryies in the url
    const queries: Object = req.query

    Object.entries(queries).forEach(([key, value]) => { // encrypted takes precedence
      if (parsed[key] === undefined) {
        parsed[key] = value
      }
    })

    if (!(parsed.url)) { // only query require is url
      return res.status(400).send("Wrong encryption. No URL is found.")
    }

    if (parsed.sent && parsed.WorkerId && parsed.url) {
      // checks if survey is completed through the paid stamp
      if (await isSurveyCompleted(parsed)) {
        return res.status(400).send("This link has already been used for submission")
      }
    }

    req.session.query = parsed
    res.redirect("/s")

  } catch (error) {
    console.error(error)
    return res.status(400).send("Wrong encryption. No URL is found. Please email researcher.")
  }

});


router.post("/survey", csrfProtection, exists_token, async (req, res) => {
  let response = setSurveyResponse(req)

  await Db_Wrapper.update(
    {"session": response["session"]}, 
    {$set: {...response}}, 
    {upsert: true}, 
    "responses"
  )

  if (!req.body["check"] || Number(req.body["curr_page"]) > Number(req.body["final"])) {
    const completion_stamp = setSurveyCompleted()
    await Db_Wrapper.update(
      {"session": response["session"]}, 
      {$set: completion_stamp}, 
      {}, 
      "responses"
    )
  
    response = await Db_Wrapper.find({"session": response["session"]}, "responses")
    response = response[0]

    const user = req.user
    let admin = false

    if (user) {
      admin = req.user.admin
    }

    if (admin == true) {  
      res.render("thanks", {
        code: JSON.stringify(response, null, 2),
        admin,
      });
    } else {
      res.render("thanks", {})
    }

} else {
  const parsed = {"url": req.body["url"], "_csrf": req.csrfToken(), "curr_page": req.body["curr_page"], }  
  getsurvey(parsed, req, res)
 }
});

router.get("/e/:data", verify_token, async (req, res) => {
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
router.get("/results", verify_admin_token, async (req, res) => {
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
router.get("/results/json", verify_admin_token, async (req, res) => {
  await Db_Wrapper.find({}, "responses")
  .then(all_responses => {res.send(all_responses)});
});
  
module.exports = router