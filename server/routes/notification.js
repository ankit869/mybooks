
// run this command after installing web-push ./node_modules/.bin/web-push generate-vapid-keys

// const vapidKeys = webpush.generateVAPIDKeys();

const webpush = require("web-push");
const log = require('log-to-file');
const {USER}= require('./models.js');
const {sendmail}= require('./mail.js');
const path = require("path")
webpush.setVapidDetails(
    "mailto:ankitkohli181@gmail.com",
    "BBy7N9L2ORQ4lPl5IJsB8lQA8s-U2M3nyRnx-KtsHV3fvID9amn3Z9NBda8wx-ZKkKweSG6tUBO2dqnZ722oUhY",
    "84R7SXSTg04LQAQk3n3sc0t1HaayMC8Sb7bWI9MP0e4"
);


async function sendNotification(title, msg, userid) {
    try {
        USER.findOne({ _id: userid }, (err, user) => {
            if(err){
                log(err, path.join(__dirname,'../error.log'))
            }else{
                if(user){
                    const subscription = user.SW_subscription;
                    const payload = JSON.stringify({ "title": title, "body": msg });
                    webpush
                        .sendNotification(subscription, payload)
                        .catch(err => log(err, path.join(__dirname,'../error.log')));
                    return "Notification sent successfully"
                }else{
                    return "User not found !!"
                }
            }
        })

    } catch (err) {
        log(err, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
}

module.exports=sendNotification