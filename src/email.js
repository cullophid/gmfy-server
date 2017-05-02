//@flow weak
import nodemailer from 'nodemailer'
const host = 'http://localhost:3000'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'invite.gmfy@gmail.com',
        pass: 'qpqb8%PIWvhjchC'
    }
});

export const sendInvite = (email, token, game) =>
  transporter.sendMail({
    from: '"Gamify 👻" <invite.gmfy@gmail.com>', // sender address
    to: email, // list of receivers
    subject: `You have been invited to the game ${game.title}`, // Subject line
    text: `Please visit ${host}/login/${token}`, // plain text body
    html: `
      <a href="${host}/login/${token}">Accept Invite</a>
    ` // html body
  })
  .then(() => "Email sent")

export const sendAuth = (email, token) =>
  transporter.sendMail({
    from: '"Gamify 👻" <invite.gmfy@gmail.com>', // sender address
    to: email, // list of receivers
    subject: `Your Authentication Link`, // Subject line
    text: `Please visit ${host}/login/${token}`, // plain text body
    html: `
      <a href="${host}/login/${token}">Sign in</a>
    ` // html body
  })
