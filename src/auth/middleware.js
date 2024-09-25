const jwt = require('jsonwebtoken')
const dotenv = require("dotenv")
const { AdminLog, UserLog } = require("../base/log.model")
dotenv.config();

function isValidUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer'

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Token expired' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ error: 'Invalid token' });
      }
      return res.status(403).json({ error: 'Could not authenticate token' });
    }

    // Token is valid, attach user info to request and proceed
    req.body.user = user;
    next();
  });
}

function isValidAdmin(req, res, next){
  
  let wallet = req.body.wallet;
  if(!wallet) wallet = req.params.wallet;
  // let isWallet = true;
  // if (wallet) {
  if (wallet == process.env.ADMIN_WALLET || wallet == process.env.ADMIN_WALLET1) next();
  else return res.status(403).json({ error: 'Access forbbiden'})
    // else return res.status(403).json({ error: 'Could not authenticate wallet' });
  //   else isWallet = false;
  // } 
  // if (!isWallet) {
    
  //   const authHeader = req.headers['authorization'];
  //   const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer'
  //   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //     if (err) {
  //       console.log("Here is token invalid")
  //       if (err.name === 'TokenExpiredError') {
  //         return res.status(403).json({ error: 'Token expired' });
  //       } else if (err.name === 'JsonWebTokenError') {
  //         return res.status(403).json({ error: 'Invalid token' });
  //       }
  //       return res.status(403).json({ error: 'Could not authenticate token' });
  //     }
  //     // Token is valid, attach user info to request and proceed
  //     req.body.user = user;
  //     next();
  //   });
  // }else  
    // return res.status(403).json({ error: 'Access forbbiden'})
}

async function log({role, user, wallet, action, model, result}){
  if(role == "admin"){
    let logData = new AdminLog({
      model, 
      user, 
      wallet, 
      action, 
      result
    })
    await logData.save()
  }else{
    let logData = new UserLog({
      model, 
      user, 
      wallet, 
      action, 
      result
    })
    await logData.save()
  }
}

module.exports = {
    isValidUser,
    isValidAdmin,
    log,
}