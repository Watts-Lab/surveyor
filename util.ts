import crypto = require("crypto")
import {Db_Wrapper, env_config} from "./config"

const private_key = crypto.scryptSync(env_config.ENCRYPT_KEY, "salt", 32)
const iv = Buffer.from(env_config.IV_KEY, 'hex')
const algorithm = 'aes-256-cbc';

export const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, private_key, iv)
    let crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex')
    return crypted
}
  
export const decrypt = (text) => {
    let decipher = crypto.createDecipheriv(algorithm, private_key, iv)
    let dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8')
    return dec
}