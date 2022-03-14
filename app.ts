require("dotenv").config();
import express = require("express");
import cors = require("cors");
import { json, urlencoded } from "body-parser";
import session = require("express-session");
import { env_config } from "./config";
import { Express } from "express"
var cookieParser = require("cookie-parser")
// Router Imports
const links_router = require("./routes/links")
const survey_router = require("./routes/survey")
const auth_router = require("./routes/auth")
const encrypt_router = require("./routes/encrypt")
const validate_router = require("./routes/validation")


export async function create_app():Promise<Express> {
  const app = express()
  app.use(cors())
  app.use(
    session({
      secret: env_config.TOKEN_KEY, // just a long random string
      resave: false,
      saveUninitialized: true,
    })
  );
  
  app.set("view engine", "pug");
  app.use(express.static("public")); // More info on this: http://expressjs.com/en/starter/static-files.html
  app.use(json()); // for parsing application/json
  app.use(urlencoded({ extended: true })); // for parsing url
  app.use(cookieParser())

    /** ROUTES */
  app.use("/", survey_router)
  app.use("/", links_router)
  app.use("/", auth_router)
  app.use("/", encrypt_router)
  app.use("/validate", validate_router)

  return app
}