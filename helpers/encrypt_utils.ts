import crypto = require("crypto")
import { env_config } from "../config"

const algorithm = 'aes-256-cbc';

export const encrypt = (text) => {
  const private_key = crypto.scryptSync(env_config.ENCRYPT_KEY, "salt", 32)
  const iv = Buffer.from(env_config.IV_KEY, 'hex')  
  const cipher = crypto.createCipheriv(algorithm, private_key, iv)
  let crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex')
  return crypted
}
  
export const decrypt = (text) => {
  const private_key = crypto.scryptSync(env_config.ENCRYPT_KEY, "salt", 32)
  const iv = Buffer.from(env_config.IV_KEY, 'hex')
  let decipher = crypto.createDecipheriv(algorithm, private_key, iv)
  let dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8')
  return dec
}

export const random_string = (size = 21) => {  
  return crypto
    .randomBytes(size)
    .toString('hex') // hex is url friendly
    .slice(0, size)
}