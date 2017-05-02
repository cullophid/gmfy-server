//@flow weak
import 'babel-polyfill'
import express from 'express'
import graphql from './graphql'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import * as auth from './auth'
import {db, r} from './rethinkdb'
import * as gameRepo from './gameRepo'
import * as userRepo from './userRepo'
const app = express()


app.use(cookieParser())

app.post('/login', [bodyParser.json()], auth.authHandler)

app.post('/auth', [bodyParser.json()], (req, res, next) =>
  auth.sendAuthEmail(req.body.email)
    .then(
      () => res.send({}),
      err => res.status(400).send(err)
    )
  )

app.use(auth.middleware)

app.use('/graphql', graphql);

app.use((err, req, res) => {
  console.log(err.stack || err)
  res.status(500).send(err)
})

app.listen(8080, () => console.log('listening on port 8080'))
