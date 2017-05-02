//@flow weak
import {db, r} from './rethinkdb'
import {map} from 'ramda'
import * as gameRepo from './gameRepo'
import * as activityRepo from './activityRepo'
import * as userRepo from './userRepo'

const eventFactory = event => ({
  ...event,
  _game: event.game,
  game: () => gameRepo.get(event.game),
  _activity: event.activity,
  activity: () => activityRepo.get(event.activity),
  _player: event.player,
  player: () => userRepo.get(event.player)
})

export const getGameEvents = gameId =>
  db.toArray(r.table('events').getAll(gameId, {index:'game'}))
    .then(map(eventFactory))

export const create = event =>
  db.run(r.table('events').insert(event))
    .then( () => eventFactory(event))
