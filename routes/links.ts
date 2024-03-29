import { env_config } from "../config"
import { Db_Wrapper } from "../databases/db"
import { verify_api_token } from "../middlewares/auth.middleware"
import { random_string } from "../helpers/encrypt_utils";
import { user_token } from "../@types";
const express = require('express')

type link_survey_request = { 
  WorkerId: string, 
  SurveyName: string, 
  url: string, 
  status: string,
}

const router = express.Router()

router.post(`/link/survey`, verify_api_token, async (req, res) => {
  const { WorkerId, SurveyName, url, status } : link_survey_request = req.body
  const user: user_token = res.locals.user

  if (
    WorkerId == null 
    || SurveyName == null 
    || url == null 
    || status == null 
    || user == null 
  ) {
    return res.status(400).send("Missing fields")
  }

  if (status !== "active" && status !== "inactive") {
    return res.status(400).send("Wrong Status Indicators")
  }

  let alias = random_string(15)
  
  while ( (await Db_Wrapper.find({alias}, "survey_links")).length ! = 0) { // only unique aliases allowed
    alias = random_string(15)
  }

  const creation_date = new Date()  
  const researcher_id = user.username

  await Db_Wrapper.insert(
    {
      alias, 
      ...req.body, 
      researcher_id,
      creation_date,
    }, "survey_links")

  const return_url = env_config.DOMAIN + 'sa/'  + alias


  return res.status(200).send({"alias": alias, "url": return_url })
})


// Redirection To Mturk URL and increments count number
router.get("/r/:alias", async (req, res) => {
  try { 
    const active = true
    const body = await Db_Wrapper.find({'alias': req.params.alias, active}, 'links')
    let {alias, url, hits} = body[0]
    if (hits === null) {
      hits = 0
    }
    Db_Wrapper.update(
      {alias, active}, 
      {$set: {'hits': hits + 1}},
      {},
      'links'
    )

    res.status(301).redirect(url) 
  } catch(error) {
    res.status(404).send('ALIAS DOES NOT EXIST')
  }

})

module.exports = router