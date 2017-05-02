//@flow weak
import {db, r} from './rethinkdb'
import * as gameRepo from './gameRepo'
import {map} from 'ramda'

const activityFactory = activity => ({
  ...activity,
  _game: activity.game,
  game: () => gameRepo.get(activity.game)
})

export const activityHandler = async ({id}, req) => {
  const activity = await get(id)
  const game = await activity.game()
  if (!game._players.includes(req.user.id)) throw new Error('Could not find Activity')
  return activity
}

export const get = id =>
  db.run(r.table('activities').get(id))
    .then(activityFactory)

export const getGameActivities = (gameId) =>
  db.toArray(r.table('activities').getAll(gameId, {index: 'game'}))
    .then(map(activityFactory))

export const create = (activity) =>
  db.run(r.table('activities').insert(activity))
    .then(() => activityFactory(activity))
