const express = require('express')
const bycrpyt = require('bcryptjs')
const jwt = require('jsonwebtoken')
import {Db_Wrapper, env_config} from "../config"
import { encrypt, decrypt } from "../util"
import { verifyAdminToken } from "../middlewares/auth.middleware"
const router = express.Router()

router.post("/encrypt", verifyAdminToken, async (req, res) => { 
    if (!req.body.url) { //only required parameter should be url
        return res.status(400).send("Missing url field")
    }

    let text = JSON.stringify(req.body)
    text = encrypt(text)
    const return_url = env_config.DOMAIN + 'se/' + text
    return res.send({'encrypted_url': return_url})
})

module.exports = router