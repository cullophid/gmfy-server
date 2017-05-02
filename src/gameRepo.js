//@flow weak
import {r, db} from './rethinkdb'
import {map} from 'ramda'
import * as userRepo from './userRepo'
import * as activityRepo from './activityRepo'
import * as eventRepo from './eventRepo'

const gameFactory = game =>
  ({...game,
    activities: () => activityRepo.getGameActivities(game.id),
    _players: game.players,
    players: (...args) => userRepo.getMany(game.players),
    log: () => eventRepo.getGameEvents(game.id),
    _owner: game.owner,
    owner: () => userRepo.get(game.owner)
  })

export const getUserGames = userId =>
  db.toArray(r.table('games').filter(r.row('players').contains(userId)))
    .then(map(gameFactory))

export const get = (id) =>
  db.run(r.table('games').get(id))
    .then(g => g ? g : Promise.reject("Could not find game"))
    .then(gameFactory)

export const gameHandler = async ({id}, req) => {
  const game = await get(id)
  if (!game._players.includes(req.user.id)) throw new Error('Could not find Game')
  return game
}

export const create = (game) =>
  db.run(r.table('games').insert(game))
    .then(() => gameFactory(game))

export const addPlayer = (gameId, userId) =>
  db.run(r.table('games').get(gameId).update({players: r.row('players').append(userId)}))
