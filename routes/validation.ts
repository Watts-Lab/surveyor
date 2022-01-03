import { Request, Response } from "express-serve-static-core";
const svgCaptcha = require("svg-captcha");
const express = require("express");
import fetch from "node-fetch";
import { parseCSV, parseJSON } from "../google_drive";
import { setSurveyCompleted, setSurveyResponse } from "../helpers/survey_helpers";
import { Db_Wrapper } from "../config";
const router = express.Router()
/* Adding Csurf protection for the router*/
var csrf = require("csurf")
const csrfProtection = csrf({ cookie: true })
const validation_flags = {"captcha": "/validate/captcha"}

router.get("/captcha", csrfProtection, (req, res) => {
  const captcha = svgCaptcha.create({"size": 10, "noise": 3});
  const data = captcha.data
  
  req.session.captcha_text = captcha.text
  res.render("captcha", {
    data: data,
    _csrf: req.csrfToken()
  })
})
  
router.post("/captcha", csrfProtection, (req, res: Response) => {
  const query = req.session.query
  query["captcha"] =  (req.session.captcha_text == req.body.captcha) ? "true" : "false"
  delete req.session["captcha_text"]
  req.session.query = query
  // After recieving captcha, redirect to validate
  res.redirect("/validate")
})


router.get("/challenge", csrfProtection, async (req, res: Response) => {
  const survey_url = new URL(req.session.survey_url)
  let survey = await fetch(survey_url)
  .then((response) => response.text())
  .then(parseCSV)

  req.session.query._csrf = req.csrfToken()
  res.render("challenge", {
    survey: survey,
    session: req.session.id,
    query: req.session.query,
  });

})

router.post("/challenge", csrfProtection, async (req, res: Response) => {
  const prefix = "validation"
  let challenge_response = setSurveyResponse(req, prefix)
  req.session.query = {...req.session.query, ...challenge_response}
  res.redirect("/validate")
})

router.get("/", csrfProtection, async (req, res: Response) => {
  // master function for all validation flags
  
  if(req.session.validations.length == 0) { // if validations are empty
    // go back to normal survey logic
    delete req.session["validation"]
    if (req.session.validations_first == false) {
      const completion_stamp = {...req.session.query, ...setSurveyCompleted()}
      
      await Db_Wrapper.update(
        {"session": req.session.id}, 
        {$set: completion_stamp}, 
        {}, 
        "responses"
      )  

      return res.redirect("/thanks")
    }

    return res.redirect("/s/")
  }

  // remove last validation flag to process
  const validation_flag: string = req.session.validations.shift()
  if (validation_flag in validation_flags) { // if keyword match
    return res.redirect(validation_flags[validation_flag])
  } 

  // otherwise assume it is url to challenge survey
  req.session.survey_url = validation_flag
  return res.redirect("validate/challenge/")
})

module.exports = router