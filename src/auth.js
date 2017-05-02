//@flow weak
import * as jwt from './jwt'
import * as userRepo from './userRepo'
import * as gameRepo from './gameRepo'
import * as Email from './email'

export const autorizeToken = async (token) => {
  const {email, gameId} = await jwt.verify(token)

  const user = await userRepo.createIfNotExists(email)
  console.log(gameId, user.id)
  if (gameId) await gameRepo.addPlayer(gameId, user.id)
  return user
}

export const authHandler = (req, res, next) => {
  const go = async (loginToken) => {
    const user = await autorizeToken(loginToken)
    const token = await jwt.sign(user)
    res.cookie('jwt', token)
    res.send(user)
  }

  go(req.body.token)
    .catch(next)
}

export const inviteHandler = authHandler
export const middleware = jwt.middleware

export const sendAuthEmail = async (email) => {
  const token = await jwt.sign({email})
  await Email.sendAuth(email, token)
  return {}
}
