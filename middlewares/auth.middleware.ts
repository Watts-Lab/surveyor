import {Db_Wrapper, env_config} from "../config"
const jwt = require('jsonwebtoken');
var csrf = require('csurf')


export const csrfProtection = csrf({ cookie: true })

export const verifyToken = (req, res, next) => {
  const token = req.session.token  

  if (token === undefined) {
    return res.status(403).redirect("/login/admin")
  }
  
  jwt.verify(token, env_config.TOKEN_KEY, (err, user) => {
    if (err) {
      return res.status(404).send("token is not verified")
    } else {
      req.user = user;
      next()
    }
  })

}

export const existsToken = (req, res, next) => {
  // if token exists, it passes non sensitive user info
  const token = req.session.token  

  if (token === undefined) {
    next()
    return 
  }
  
  jwt.verify(token, env_config.TOKEN_KEY, (err, user) => {
    if (err) {
      next()
      return 
    } else {
      req.user = user;
      next()
    }
  })

}

export const verifyAdminToken = (req, res, next) => {
  const token = req.session.token  

  if (token === undefined) {
    return res.status(403).redirect("/login/researcher")
  }
  
  jwt.verify(token, env_config.TOKEN_KEY, (err, user) => {
    if (err) {
      return res.status(404).send("token is not verified")
    } else if (!user.admin) {
      return res.status(403).send("USER IS NOT ADMIN")
    } else {
      req.user = user;
      next()
    }
  })


}