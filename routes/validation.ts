import {Db_Wrapper, env_config} from "../config"
import { ParsedQs } from "qs";
import { Request, Response } from "express-serve-static-core";
const svgCaptcha = require('svg-captcha');
const express = require("express");
import fetch from "node-fetch";
import { parseCSV, parseJSON } from "../google_drive";
import { setSurveyResponse } from "../helpers/survey_helpers";

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
  query["captcha"] = (req.session.captcha_text == req.body.captcha)
  delete req.session['captcha_text']
  req.session.query = query
  // After recieving captcha, redirect to validate
  res.redirect('/validate')
})


router.get("/challenge", csrfProtection, async (req, res: Response) => {
  const survey_url = new URL(req.session.survey_url)
  let survey = await fetch(survey_url)
  .then((response) => response.text())
  .then(parseCSV)

  res.render("challenge", {
    survey: survey,
    session: req.session.id,
    query: req.session.query,
    _csrf: req.csrfToken()
  });

})

router.post("/challenge", csrfProtection, async (req, res: Response) => {
  let challenge_response = setSurveyResponse(req)
  req.session.query = challenge_response
  res.redirect('/validate')
})

router.get("/", csrfProtection, async (req, res: Response) => {
  // master function for all validation flags
  const query = req.session.query
  
  if(query.validations.length == 0) { // if validations are empty
    // go back to normal survey logic
    return res.redirect("/s/")
  }

  // remove last validation flag to process
  const validation_flag: string = query.validations.pop()
  if(validation_flag in validation_flags ) { // if keyword match
    return res.redirect(validation_flags[validation_flag])
  } 
  
  // otherwise assume it is url to challenge survey
  req.session.url = validation_flag
  return res.redirect("/challenge/")

  
})

module.exports = router