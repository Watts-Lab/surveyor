import { Express } from "express"
import { Server } from "http";
import supertest = require("supertest");
import { create_app } from "../app";
import { start_server } from "../server";
const request = require('supertest');

let app: Express
let server: Server

beforeAll(async() => {
  app = await create_app()
})


test("should return OK response generating survey", (done) => {
  const survey_url = "https://raw.githubusercontent.com/Watts-Lab/surveyor/main/surveys/CRT.csv"    
  
  request(app)
    .get(`/s/?url=${survey_url}`)
    .expect(200)
    .end((err, res) => {
      if (err) return done(err);
      return done();
    })
  
})

