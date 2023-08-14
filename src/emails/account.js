const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'pppoooppp654852@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me show you what I got.`
    })
}

const sendByeEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: 'pppoooppp654852@gmail.com',
        subject: 'So sad to hear that!',
        text: `${name}, you have canceled the account of Task-Manager. I would like to know why you did this decision.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendByeEmail
}