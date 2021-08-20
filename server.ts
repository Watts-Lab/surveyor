/** @format */
require("dotenv").config();
import express = require("express");
import cors = require("cors");
import { json, urlencoded } from "body-parser";
// import { pick } from "./tools";
import { parseCSV, parseJSON } from "./google_drive";
import { users, surveys, responses } from "./database";
import fetch from "node-fetch";
import cookieParser = require("cookie-parser");
import session = require("express-session");
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(
  session({
    secret: "commonsense", // just a long random string
    resave: false,
    saveUninitialized: true,
  })
);

const admin = true;
const required = true;

app.set("view engine", "pug");
app.use(express.static("public")); // More info on this: http://expressjs.com/en/starter/static-files.html
app.use(json()); // for parsing application/json
app.use(urlencoded({ extended: true })); // for parsing url

const listener = app.listen(process.env.PORT ? process.env.PORT : 4000, () => {
  console.log(
    `Listening on port ${
      listener.address()["port"]
    }\nPreview at http://localhost:${listener.address()["port"]}`
  );
});

export const startServer = async () => {};

//for now we will not run with admin == true, so I think we should switch this to a 404 response for the time being and we can deal with other aspects a bit later.
app.get("/", (req, res) => {
  if (admin) {
    res.render("admin", {
      title: "Task robot admin page",
      host: req.headers.host,
    });
  } else res.redirect("/survey");
});

// Test URL: https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv
app.get("/s/", async (req, res) => {
  if (req.query.url) {
    try {
      res.render("survey", {
        query: req.query,
        survey: await fetch(String(req.query.url))
          .then((res) => res.text())
          .then(parseCSV),
        required: required,
        admin: admin,
        session: req.session.id,
      });
    } catch (error) {
      console.error(error);
    }
  } else res.redirect("/");
});

app.post("/survey", (req, res) => {
  responses.insert(req.body);
  if (admin) {
    res.render("thanks", {
      code: JSON.stringify(req.body, null, 2),
      admin: admin,
    });
  } else res.redirect("/"); // Needs to be updated to deal with multiple page surveys
});

// This needs to be authenticated and to deal with multiple surveys in the future
app.get("/delete/:id", (req, res) => {
  responses.remove({ _id: req.params.id });
  res.redirect("/results");
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
app.get("/results", (req, res) => {
  responses.find().then((all_responses) => {
    const names = Array.from(
      new Set(all_responses.flatMap((r) => Object.keys(r)))
    ).sort();
    res.render("table", { names: names, rows: all_responses, admin: admin });
  });
});

// This needs to be encrypted to only give results to someone who is authenticated to read them
app.get("/results/json", (req, res) => {
  responses.find().then((all_responses) => res.send(all_responses));
});
// };
