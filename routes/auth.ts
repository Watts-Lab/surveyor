const express = require("express")
const bycrpyt = require("bcryptjs")
const jwt = require("jsonwebtoken")
import { user_token } from "../@types"
import { Db_Wrapper, env_config } from "../config"
import { Base64 } from "js-base64"

const router = express.Router()
/* Adding Csurf protection for the router*/
const csrf = require("csurf")
const csrfProtection = csrf({ cookie: true })

const get_user_token = (username: string, admin: boolean) => {
  const token: user_token = jwt.sign(
    { username, admin },
    env_config.TOKEN_KEY,
    {
      expiresIn: "2h",
    }
  )

  return token
}

router.get("/login/admin", csrfProtection, async (req, res) => {
  res.render("login", {
    name: "Admin Login",
    endpoint: "/login/admin",
    alt_endpoint: "/login/researcher",
    alt_name: "Researcher Login",
    csrfToken: req.csrfToken(),
  })
})

router.get("/login/researcher", csrfProtection, async (req, res) => {
  res.render("login", {
    name: "Researcher Login",
    endpoint: "/login/researcher",
    alt_endpoint: "/login/admin",
    alt_name: "Admin Login",
    csrfToken: req.csrfToken(),
  })
})

router.post("/api/login/admin", async (req, res) => {
  // api calls do not need csrf protection
  // no cookies being used here

  const auth_header: string = req.headers.authorization

  if (auth_header == undefined) {
    return res.status(400).send("Missing Credentials")
  }

  let credentials: string = auth_header.split("Basic ")[1]
  credentials = Base64.decode(credentials)

  const username = credentials.trim().split(":")[0]
  const password = credentials.trim().split(":")[1]

  const users = await Db_Wrapper.find({ username }, "internalUsersSurveyor")
  const user = users[0]
  let pass_comparison = undefined

  if (user) {
    pass_comparison = await bycrpyt.compare(password, user.password)
  }

  if (user && pass_comparison) {
    const token = get_user_token(username, false)
    return res.send({ token: token })
  } else {
    return res.status(400).send("Invalid Credentials")
  }

  return res.send(credentials)
})

router.post("/login/researcher", csrfProtection, async (req, res) => {
  const { username, password } = req.body

  if (!(username && password)) {
    return res.status(400).send("User and Password")
  }

  const user = (await Db_Wrapper.find({ username }, "researchers"))[0]
  const pass_comparison = await bycrpyt.compare(password, user.password)
  if (user && pass_comparison) {
    const token = get_user_token(username, false)
    req.session.token = token
    return res.status(200).redirect("/")
  } else {
    return res.status(400).send("Invalid Credentials")
  }
})

router.post("/login/admin", csrfProtection, async (req, res) => {
  const { username, password } = req.body

  if (!(username && password)) {
    return res.status(400).send("Error: User and Password Is Empty")
  }
  const users = await Db_Wrapper.find({ username }, "internalUsersSurveyor")
  const user = users[0]
  let pass_comparison = false

  if (user) {
    pass_comparison = await bycrpyt.compare(password, user.password)
  }

  if (pass_comparison) {
    const token = get_user_token(username, true)
    req.session.token = token
    return res.status(200).redirect("/")
  } else {
    return res.status(400).send("Invalid Credentials")
  }
})

router.post("/signup/admin", async (req, res) => {
  const { username, password, secret_key } = req.body

  if (!(username && password && secret_key)) {
    return res.status(400).send("Missing Inputs")
  }

  if (secret_key !== env_config.SECRET_KEY) {
    return res
      .status(400)
      .send("Secret token is necessary for creation of admin user")
  }

  const oldUser = await Db_Wrapper.find({ username }, "researchers")
  if (!oldUser) {
    return res.status(409).send("User exists. please login or create new user")
  }

  const encryptPass = await bycrpyt.hash(password, 10)
  await Db_Wrapper.insert(
    { username, password: encryptPass },
    "internalUsersSurveyor"
  )
  const token = get_user_token(username, true)
  return res.status(200).send({ token })
})

module.exports = router
//For now I won't put this endpoint since we might want to do some email validation
//router.post("/signup", async (req, res) => {})
/*
 router.post('/signup', async (req, res) => {
  const {username, password} = req.body

  if (!(username && password)) {
    res.send(400).send("Missing Inputs")
  }

  const oldUser = await Db_Wrapper.find({username}, "researchers")
  
  if (oldUser) {
    return res.status(409).send("User exists. please login or create new user")
  }

  const encryptPass = await bycrpyt.hash(password, 10)
  await Db_Wrapper.insert({username, "password": encryptPass}, "researchers")

  const token = jwt.sign(
    {username, admin: false},
    env_config.TOKEN_KEY,
    {
      expiresIn: "2h"
    }
  )

  res.status(200).json_body({token})

})*/
