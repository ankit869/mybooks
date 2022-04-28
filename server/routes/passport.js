const passport = require("passport")
const log = require('log-to-file');
const {USER}= require('./models.js');
const sendmail= require('./mail.js');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(USER.createStrategy());
const path = require("path")
const _ = require("lodash");

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    USER.findById(id, function(err, user) {
        if(err){
            log(err.stack, path.join(__dirname,'../error.log'))
        }
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://mybooks-free.com/auth/google/mybooks",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo" //this is used because google+ has been deprecated
    },
    function(accessToken, refreshToken, profile, cb) {
        searchtag = _.trim(_.toLower(profile.displayName)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '') + "-" + profile.emails[0].value;
        USER.findOrCreate({ googleId: profile.id, name: profile.displayName, userimage: profile.photos[0].value, username: profile.emails[0].value, email: profile.emails[0].value, isGoogleUser:true },
            (err, user) => {
                if (!err) {
                    return cb(err, user);
                }else if(err){
                    log(err.stack, path.join(__dirname,'../error.log'))
                } else {
                    return cb(null, false, 'you are already a  member')
                }
            }
        )
   
    })
);

module.exports= passport