import { Database_Wrapper } from "./interfaces";
import Nedb from "./databases/test_db";
import Mongo from "./databases/prod_db";
import exp = require("constants");
    


const env_config = {
    PORT: parseInt(process.env.PORT),
    URI: process.env.PROD.toLowerCase() == "true" ? process.env.PROD_URI : process.env.TEST_URI,
    DB: process.env.PROD.toLowerCase() == "true" ? process.env.PROD_DB : process.env.TEST_DB,
    RANDOM: process.env.RANDOM,
    TOKEN_KEY: process.env.TOKEN_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    ENCRYPT_KEY: process.env.ENCRYPT_KEY,
    IV_KEY: process.env.IV_KEY,
    DOMAIN: process.env.DOMAIN
}

if (env_config.URI === undefined || env_config.DB === undefined) {
    throw new Error("Please set mongo db uri or db")
}

const Db_Wrapper: Database_Wrapper = new Mongo(env_config);
Db_Wrapper.set_db(env_config.DB);  

export {Db_Wrapper, env_config}