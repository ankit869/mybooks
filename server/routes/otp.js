const _ = require("lodash");
const log = require('log-to-file');
const {USER}= require('./models.js');
const sendmail= require('./mail.js');
const otp_mail = require("../../mail_templates/otp_template.js")
const {redis_setotp}=require('./redis_conf.js');
const path = require("path")
async function sendOTP(username, otp, msg) {
    try {
        redis_setotp(username+'-OTP', otp)
        sendmail(username, msg, '', otp_mail(otp))
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
    }
}

async function validateOTP(username, otp) {
    try {
        isValidate=false;
        return new Promise((resolve, reject) => { 
            client.get(username+'-OTP', function(err, response) {
                if(err){ 
                    log(err.stack, path.join(__dirname,'../error.log'))
                }else{
                    if(response==otp){
                        isValidate=true
                    }
                }
                resolve(isValidate)
            })
        })
        
        
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
    }
}

module.exports={sendOTP,validateOTP}