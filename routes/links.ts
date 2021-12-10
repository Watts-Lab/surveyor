import {Db_Wrapper, env_config} from "../config"
import { verify_api_token } from "../middlewares/auth.middleware"
import { random_string } from "../helpers/encrypt_utils";
import { user_token } from "../@types";
const express = require('express')

type link_survey_request = { 
  worker_id: string, 
  survey_name: string, 
  url: string, 
  status: string,
}

const router = express.Router()
router.post(`/link/survey`, verify_api_token, async (req, res) => {
  const { worker_id, survey_name, survey_url, status } : link_survey_request = req.body
  const user: user_token = res.locals.user

  if (
    worker_id == null 
    || survey_name == null 
    || survey_url == null 
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
      worker_id, 
      researcher_id,
      survey_name, 
      survey_url, 
      creation_date,
      status
    }, "survey_links")

  const return_url = env_config.DOMAIN + 'sa/'  + alias


  return res.status(200).send({"alias": alias, "url": return_url })
})



router.post(`/link/survey`, verify_api_token, async (req, res) => {
  const { worker_id, survey_name, url, status } : link_survey_request = req.body
  const user: user_token = res.locals.user

  if (
    worker_id == null 
    || survey_name == null 
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
      worker_id, 
      researcher_id,
      survey_name, 
      url, 
      creation_date,
      status
    }, "survey_links")

  const return_url = env_config.DOMAIN + 'sa/'  + alias


  return res.status(200).send({"alias": alias, "url": return_url })
})



/* THIS NEEDS TO BE AUTHENTICATED TO ADMIN USER
 Since this will be live.
 Current Hacky solution: Post enpoint root with random string 
 because someone not authenticate might
 stumble on to it when authentication is not set up.*/
// Create New Link if it doesn't exist otherwise update

//Note to self put this functionality in python backend services
// will be deleted one I update the mturk hits pipeline not to depend on it
router.post(`/link/${env_config.RANDOM}`, async (req, res) => {
    const { alias, url } = req.body
  
    // Set old link if it exists to inactive
    // With current logic there can only be one active link
    await Db_Wrapper.update(
      {alias, 'active': true}, {$set: {'active': false, 'end': Date().toString()}}, 
      {}, 
      'links'
    )
  
    // create new alias if post request has been sent
    // Only active link with this alias
    await Db_Wrapper.insert({alias, url, 'hits': 0, 'active': true, 'start': Date().toString(), 'end': null}, 'links')
    
  
    res.status(200).send('OK')
  })

  //Note to self put this functionality in python backend services
  // will be deleted one I update the mturk hits pipeline
router.get(`/link/${env_config.RANDOM}/:alias`, async (req, res) => {
  const body = await Db_Wrapper.find({'alias': req.params.alias}, 'links')
  res.status(200).send(body)
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