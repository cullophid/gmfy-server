//@flow weak
import {db, r} from './rethinkdb'
import {map} from 'ramda'
import {v4 as uuid} from 'uuid'
import * as gameRepo from './gameRepo'
import {head} from 'ramda'

const userFactory = user => user ? ({
  ...{firstName:"", lastName: ""},
  ...user,
  games: () => gameRepo.getUserGames(user.id)
}) : null

export const getMany = userIds =>
  db.toArray(r.table('users').getAll(r.args(userIds)))
    .then(map(userFactory))

export const get = id =>
  db.run(r.table('users').get(id))
    .then(userFactory)

export const getUserByEmail = email =>
  db.toArray(r.table('users').getAll(email, {index:'email'}))
    .then(head)
    .then(userFactory)

export const create = (user) => {
  const newUser = {...user, id: uuid()}
  return db.run(r.table('users').insert(newUser))
    .then(() => userFactory(newUser))
}

export const createIfNotExists = (email) =>
    getUserByEmail(email)
      .then(u => (console.log("user", u), u))
      .then(user => user ? user : create({email}))
      .then(u => (console.log("userObject", u), u))
