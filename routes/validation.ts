import {Db_Wrapper, env_config} from "../config"
import { ParsedQs } from "qs";
import { Request, Response } from "express-serve-static-core";
const svgCaptcha = require('svg-captcha');
const express = require("express");


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
  
router.post("/captcha", csrfProtection, (req, res) => {
  const query = req.session.query
  query["captcha"] = (req.session.captcha_text == req.body.captcha)
  req.session.query = query
  res.redirect('/validate')
})


router.get("/", csrfProtection, async (req, res: Response) => {
  const query = req.session.query
  
  if(query.validations.length == 0) {
    console.log('query')
    res.redirect("/s/")
  } else {
    const validation_flag: string = query.validations.pop()
    res.redirect(validation_flags[validation_flag])
  }
})

router.post('/', csrfProtection, async (req, res) => {
    console.log(req)
})

module.exports = router