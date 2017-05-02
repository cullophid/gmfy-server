//@flow weak
import  graphqlHTTP from 'express-graphql'
import  jwt from 'jsonwebtoken'
import  {buildSchema} from 'graphql'
import  {db, r} from './rethinkdb'
import  {v4 as uuid} from 'uuid'
import  {map} from 'ramda'
import * as Email from './email'
import  * as gameRepo from './gameRepo'
import  * as userRepo from './userRepo'
import  * as activityRepo from './activityRepo'
import  * as eventRepo from './eventRepo'

const JWT_SECRET = 'RlWxxrnWdgw"tohuRlyzpOCoHeMSNpkjAXWVdTWYQisw0'

const schema = buildSchema(`

  input GameForm {
    title: String!
    description: String!
    icon: String!
  }

  input ActivityForm {
    title: String!
    game: String!
    description: String!
    icon: String!
    points: Int!
  }

  type User {
    id: ID!
    email: String!,
    firstName: String!,
    lastName: String!,
    games: [Game]
  }

  enum EventType {
    ACTIVITY_COMPLETED
  }

  type Event {
    id: ID!
    type: EventType!
    _game: String!
    game: Game!
    activity: Activity!
    _player: String!
    player: User!
    time: String!
    score: Int!
  }

  type Game {
    id: ID!
    title: String!
    description: String!
    icon: String!
    owner: User!
    players: [User]!
    log: [Event]!
    activities: [Activity]!
  }

  type Activity {
    id: ID!
    game: Game!
    title: String!
    description: String!
    icon: String!
    points: Int!
  }

  type Query {
    session: User
    games: [Game]
    game(id: ID): Game
    activity(id: ID): Activity
  }

  type Mutation {
    completeActivity(id: ID!): Event
    createGame(gameForm: GameForm): Game
    createActivity(activityForm: ActivityForm): Activity
    invitePlayer(gameId: ID!, email: String!): String
  }
`)

const completeActivityEvent = (player, game, activity) =>
  ({
    id: uuid(),
    type: "ACTIVITY_COMPLETED",
    player,
    game,
    activity: activity.id,
    time: new Date().toUTCString(),
    score: activity.points
  })

const completeActivity = async ({id:activityId}, req) => {
  const activity = await activityRepo.get(activityId)
  const game = await activity.game()
  if (!game._players.includes(req.user.id)) return Promise.reject('Activity Not Found')
  const event = completeActivityEvent(req.user.id, game.id, activity)
  return await eventRepo.create(event)
}

const invitePlayer = async ({gameId, email}, req) => {
  const game = await gameRepo.get(gameId)
  if (!game._owner == req.user.id) throw new Error("Game not found")
  const token = jwt.sign({gameId: gameId, email}, JWT_SECRET)
  await Email.sendInvite(email, token, game)
  return "Invite Sent"

}

const root = {
  completeActivity,
  createGame: ({gameForm}, req) => gameRepo.create({...gameForm, id: uuid(), players: [req.user.id], owner: req.user.id}),
  createActivity: ({activityForm}, req) => activityRepo.create({...activityForm, id: uuid()}),
  game: gameRepo.gameHandler,
  games: (args, req) => gameRepo.getUserGames(req.user.id),
  activity: activityRepo.activityHandler,
  invitePlayer: invitePlayer,
  session: (_, req) => userRepo.get(req.user.id)
};

export default graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
})
