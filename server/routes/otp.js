const _ = require("lodash");
const log = require('log-to-file');
const {USER}= require('./models.js');
const sendmail= require('./mail.js');
const otp_mail = require("../../mail_templates/otp_template.js");
const path = require("path")
async function sendOTP(username, otp, msg) {
    try {
        var result = false;
        await USER.updateOne({ username: username }, { $set: { tmp_otp: otp } }, (err) => {
            if (!err) {
                sendmail(username, msg, '', otp_mail(otp))
                startTimerOTP(username)
                result = true
            }else{
                log(err.stack, path.join(__dirname,'../error.log'))
            }
        })
        return result
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
    }
}

function startTimerOTP(username) {
    otpTimer = setTimeout(function() {
        USER.updateOne({ username: username }, { $unset: { tmp_otp: "" } }, (err) => {
            if (err) {
                log(err.stack, path.join(__dirname,'../error.log'))
            }
        })
    }, 600000)
}

async function validateOTP(username, otp) {
    try {
        var result = false;
        await USER.findOne({ username: username }, (err, user) => {
            if (!err && user) {
                if (user.tmp_otp == otp) {
                    result = true
                } else {
                    result = false
                }
            }
            if(err){
                log(err.stack, path.join(__dirname,'../error.log'))
            }
        })
        return result
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
    }
}

module.exports={sendOTP,validateOTP}