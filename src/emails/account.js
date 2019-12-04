const sgMail = require('@sendgrid/mail')
require('dotenv').config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.ADMIN_EMAIL,
    subject: 'Welcome to Task Manager',
    text: `Welcome to the app ${name}. Let us know how you get on with the app.`
  })
}

const sendFarewellEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.ADMIN_EMAIL,
    subject: 'Sorry to see you leave',
    text: `Farewell from Task Manager ${name}. Is there anything we could have done to keep your business?`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendFarewellEmail
}
