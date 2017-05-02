//@flow weak
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'

const JWT_SECRET = 'RlWxxrnWdgw"tohuRlyzpOCoHeMSNpkjAXWVdTWYQisw0'

export const middleware = expressJwt({secret:JWT_SECRET, getToken: req => req.cookies.jwt})

export const sign = data =>
  new Promise((resolve, reject) =>
    jwt.sign(data, JWT_SECRET, {}, (err, token) => err ? (console.log(err), reject(err)) : resolve(token))
  )

export const verify = token =>
  new Promise((resolve, reject) =>
    jwt.verify(token, JWT_SECRET, (err, data) => err ? reject(err) : resolve(data))
  )
