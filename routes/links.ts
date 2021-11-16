import {Db_Wrapper, env_config} from "../config"
const express = require('express');

const router = express.Router()

/* THIS NEEDS TO BE AUTHENTICATED TO ADMIN USER
 Since this will be live.
 Current Hacky solution: Post enpoint root with random string 
 because someone not authenticate might
 stumble on to it when authentication is not set up.*/
// Create New Link if it doesn't exist otherwise update
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