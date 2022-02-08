var nodemailer = require('nodemailer');
const { google } = require("googleapis")
const mailgun = require("mailgun-js")({ apiKey: "872495e7a55231040856144bb1c55d5d-7b8c9ba8-654a9015", domain: "mybooks-free.com" })
const {TOKEN}=require('./models.js')
const log = require('log-to-file');
const path = require("path")
//https://accounts.google.com/b/0/DisplayUnlockCaptcha also enable this

async function sendmail(reciever, subject, message, html) {
    try {
        TOKEN.findOne({ type: "email-auth-token" }, async(err, token) => {
            const oAuth2Client = new google.auth.OAuth2(process.env.MAIL_CLIENT_ID, process.env.MAIL_CLIENT_SECRET, process.env.MAIL_REDIRECT_URL)
            oAuth2Client.setCredentials({ refresh_token: token.refreshToken })
            accessToken = oAuth2Client.getAccessToken((err) => {
                if (err) {
                    log('NodeMailer ERROR', path.join(__dirname,'../error.log'))
                    console.log("Error while sending email from nodemailer");
                    const data = {
                        from: 'myBooks <mailgun@mybooks-free.com>',
                        to: reciever,
                        subject: subject,
                        text: message,
                        html: html
                    };
                    const data2 = {
                        from: 'myBooks <mailgun@mybooks-free.com>',
                        to: ['ankitkholi1181@gmail.com', 'mybooks.webmaster@gmail.com'],
                        subject: "ERROR !! NODEMAILER",
                        text: "please check the auth keys in node mailer as it is not working due to this error --->"+err,
                    };

                    mailgun.messages().send(data, function(error1, body) {
                        if (!error1) {
                            mailgun.messages().send(data2, function(error2, body) {
                                if (!error2) {
                                    console.log("Backup Email sent successfully from mailgun-js");
                                }
                            });
                        } else {
                            log('MailGun ERROR', path.join(__dirname,'../error.log'))
                            console.log("Backup Email failed from mailgun-js");
                        }
                    });
                    // USER.findOne({username:"ankitkohli181@gmail.com"},(err,user)=>{
                    //     const subscription =user.SW_subscription;
                    //     const payload = JSON.stringify({"title": "ERROR !! NODEMAILER", "body": "please check the auth keys in node mailer as it is not working due to some issues"});
                    //     webpush
                    //         .sendNotification(subscription, payload)
                    //         .catch(err => console.error(err));
                    // })
                }
            })

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: 'mybooks.webmaster@gmail.com',
                    clientId: process.env.MAIL_CLIENT_ID,
                    clientSecret: process.env.MAIL_CLIENT_SECRET,
                    refreshToken: token.refreshToken,
                    accessToken: accessToken,

                    user: "admin@mybooks-free.com",
                    pass: "95@Okaxis",

                }
            });

            var mailOptions = {
                from: 'myBooks <mybooks.webmaster@gmail.com>',
                to: reciever,
                subject: subject,
                text: message,
                html: html,
            };

            await transporter.sendMail(mailOptions, (err, result) => {
                if (!err) {
                    console.log("Email sent successfully from nodemailer")
                }else{
                    log('NodeMailer ERROR', path.join(__dirname,'../error.log'))
                }
            });

        })

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
    }
}

module.exports = sendmail



// /*
//  1) Install Courier SDK: npm install @trycourier/courier
//  2) Make sure you allow ES module imports: Add "type": "module" to package.json file 
//  */
//  import { CourierClient } from "@trycourier/courier";

//  const courier = CourierClient(
//    { authorizationToken: "pk_prod_YTQZXTZNW7MSRJKVG8APQWTV4ZJ0"});
 
//  const { messageId } = await courier.send({
//    eventId: "courier-quickstart",
//    recipientId: "mybooks.webmaster@gmail.com",
//    data: {
//      favoriteAdjective: "awesomeness"
//    },
//    profile: {
//      email: "mybooks.webmaster@gmail.com"
//    }
//  });