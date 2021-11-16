import {Db_Wrapper, env_config} from "../config"
const jwt = require('jsonwebtoken');

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token)

  if (token === undefined) {
    return res.status(403).send("token is not found")
  }
  
  jwt.verify(token, env_config.TOKEN_KEY, (err, user) => {
    if (err) {
      return res.status(404).send("token is not verified")
    } 
    req.user = user;
  })

    next()
}

export const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token)

  if (token === undefined) {
    return res.status(403).send("token is not found")
  }
  
  jwt.verify(token, env_config.TOKEN_KEY, (err, user) => {
    if (err) {
      return res.status(404).send("token is not verifiend")
    } else if (!user.admin) {
      return res.status(403).send("USER IS NOT ADMIN")
    }
    req.user = user;
  })


  next()
}