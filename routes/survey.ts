import {env_config} from "../config"
import { Db_Wrapper } from "../databases/db"

const express = require("express");
import { parseCSV, parseJSON } from "../google_drive";
import { ParsedQs } from "qs";
import { Request, Response } from "express-serve-static-core";
// helpers
import { encrypt, decrypt, random_string } from "../helpers/encrypt_utils"
import { 
  setPageNums, setSurveyResponse, 
  setSurveyCompleted, isSurveyCompleted, 
} from "../helpers/survey_helpers";

import axios from "axios";
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

const getMultipageSurvey = (query: string | ParsedQs, req: Request<{}>, res: Response<any>, survey: Object[], page, pagefinal, ) => {
  let max = 0

  survey.forEach((elem, idx) => {
    page = Number(elem["page"])
    if (page > max) {
      max = page
    } else if (page == undefined) {
      survey[idx]["page"] = 0
    }
  })

  let startnumber = 1
  if (req.body["start"]) {
    startnumber = Number(req.body["start"])
  }

  res.render("form", {
    query: query,
    survey: survey,
    required: required,
    admin: req.user ? req.user.admin : false,
    session: req.session.id,
    final: pagefinal,
    check: page,
    start: startnumber,
    max: max,
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
    let survey = await axios.get(survey_url.toString())
    .then((response) => response.data)
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


const add_query = (query: Object, parsed: Object) => {
  Object.entries(query).forEach(([key, value]) => {
    if (parsed[key] === undefined) { // never overwrites parsed params
      parsed[key] = value;
    }
  });
}

  // Test URL: https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv
// e.g. http://localhost:4000/s/?url=https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv&name=Mark
router.get("/s/", csrfProtection, async (req, res) => {
  let parsed = undefined
  if (req.session.query) {
    parsed = req.session.query
    delete req.session["query"]
  } else {
    parsed = req.query
  }

  parsed._csrf = req.csrfToken()
  parsed.curr_page = 0
  parsed.start_time = new Date().toISOString() 
  let survey_session = random_string(10)

  while ( (await Db_Wrapper.find({survey_session}, "survey_links")).length ! = 0) { // only unique aliases allowed
    survey_session = random_string(10)
  }

  parsed.survey_session = survey_session
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

  let parsed = record[0]

  // queryies in the url
  if (req.query) {
    add_query(req.query, parsed);
  }
  if (parsed.status == 'inactive') {
    return res.status(400).send("URL has expired.")
  }

  req.session.alias = alias

  parsed._csrf = req.csrfToken()
  // meta data deleted
  delete parsed['status']
  delete parsed['creation_date']
  delete parsed['_id']
  
  // validations meta data
  const validations_start: string[] = parsed.validations_start
  // validations_first flag 1 is true, 0 is false
  const validations_end: string[] = parsed.validations_end
  req.session.query = parsed
  
  if (validations_start) {
    req.session.validations_start = validations_start
  }
  if (validations_end) {
    req.session.validations_end = validations_end
  }
  
  if (validations_start == null || validations_start.length == 0) {  
    req.session.start = false;
    res.redirect("/s")
  } else { // if validation_first is undefined it will default as first
    req.session.start = true;
    res.redirect("/validate")
  }
})

router.get("/se/:encrypted", csrfProtection, async (req, res) => {
  try {
    const encrypted = req.params.encrypted
    const decrypted = decrypt(encrypted)
    const parsed = await JSON.parse(decrypted)
    
    if (req.query) {
      add_query(req.query, parsed)
    }
    if (!(parsed.url)) { // only query require is url
      return res.status(400).send("Wrong encryption. No URL is found.")
    }

    if (parsed.sent && parsed.WorkerId && parsed.url) {
      // checks if survey is completed through the paid stamp
      if (await isSurveyCompleted(parsed)) {
        return res.status(400).send("This link has already been used for submission")
      }
    }

    const validations = parsed.validations
    const validations_first = (parsed.validations_first == 1)

    req.session.query = parsed
    
    if (validations_first == false) {
      req.session.validations_first = false
    }

    if (validations != undefined) {
      req.session.validation = validations
    }

    if (validations == null || validations.length == 0 || validations_first == false) {  
      res.redirect("/s")
    } else { // if validation_first is undefined it will default as first
      res.redirect("/validate")
    }
  } catch (error) {
    console.error(error)
    return res.status(400).send("Wrong encryption. No URL is found. Please email researcher.")
  }

});


router.get("/thanks", exists_token, async (req, res) => {
  const user = req.user
  let admin = false

  if (req.session.alias) {
    Db_Wrapper.update(
      {"alias": req.session.alias}, 
      {"$set": {"status": "inactive"}}, 
      {},
       "survey_links"
  )}

  if (user) {
    admin = req.user.admin
  }

  if (admin == true) {    
    let response = await Db_Wrapper.find({"survey_session": req.session.id}, "responses")
    response = response[0]
    return res.render("thanks", {
      code: JSON.stringify(response, null, 2),
      admin,
    })
  }  
  
  return res.render("thanks", {})
})

router.post("/survey", csrfProtection, exists_token, async (req, res) => {
  let response = setSurveyResponse(req)
  await Db_Wrapper.update(
    {"survey_session": response["survey_session"]}, 
    {$set: {...response}}, 
    {upsert: true}, 
    "responses"
  )

  if (!req.body["check"] || Number(req.body["curr_page"]) > Number(req.body["final"])) { 
    if (req.session.validations_end != undefined && req.session.validations_end.length != 0) {
      req.session.query = {}
      return res.redirect("/validate")
    }

    const completion_stamp = setSurveyCompleted()
    await Db_Wrapper.update(
      {"survey_session": response["survey_session"]}, 
      {$set: completion_stamp}, 
      {}, 
      "responses"
    )

    return res.redirect("/thanks")

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