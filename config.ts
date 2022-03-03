import { Database_Wrapper } from "./interfaces";
import Mongo from "./databases/db";
import { env_file } from "./@types";
import { MongoMemoryServer } from 'mongodb-memory-server';

const env_config: env_file = {
  PORT: parseInt(process.env.PORT),
  URI: process.env.URI,
  DB: process.env.PROD.toLowerCase() == "true" ? process.env.PROD_DB : process.env.TEST_DB,
  TOKEN_KEY: process.env.TOKEN_KEY,
  SECRET_KEY: process.env.SECRET_KEY,
  ENCRYPT_KEY: process.env.ENCRYPT_KEY,
  IV_KEY: process.env.IV_KEY,
  DOMAIN: process.env.DOMAIN,
  PROD: process.env.PROD.toLowerCase() == "true" 
}

if (env_config.URI === undefined || env_config.DB === undefined) {
    throw new Error("Please set mongo db uri or db")
}

export {env_config}
