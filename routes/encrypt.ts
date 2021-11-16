const express = require('express')
const bycrpyt = require('bcryptjs')
const jwt = require('jsonwebtoken')
import { use } from "marked"
import {Db_Wrapper, env_config} from "../config"
import { encrypt, decrypt } from "../util"

const router = express.Router()

router.post("/encrypt", async (req, res) => {
    //For debugging purposes. Prints encrypted version of url. In the future, this will be done in researcher menu.
    const { url, worker_id } = req.body
    let text = `{"url":"${url}", "WorkerId":"${worker_id}"}`
    if (!url || !worker_id) {
        res.status(404).send("Missing fields url and workerid")
    }
    text = encrypt(text)
    const return_url = env_config.DOMAIN + text
    return res.send({'encrypted_url': return_url})
})

module.exports = router