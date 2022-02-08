const { google } = require("googleapis")
const log = require('log-to-file');
var key = require("../../auth_files/private_key.json");

var jwToken = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key, ["https://www.googleapis.com/auth/drive"],
    null
);

jwToken.authorize((err) => {
    if (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        return;
    }
    // else {
    //   console.log("Authorization accorded for drive");
    // }
});

const drive = google.drive({
    version: 'v3',
    auth: jwToken
})

module.exports=drive