
const { google } = require("googleapis")
const log = require('log-to-file');
const request = require('request');
var index_key = require("../../auth_files/indexing_key.json");
const fs = require('fs')
const path = require('path')
const batch = fs
    .readFileSync(path.join(__dirname, '../../readme/urls.txt'))
    .toString()
    .split('\n');

var jwToken = new google.auth.JWT(
    index_key.client_email,
    null,
    index_key.private_key, ["https://www.googleapis.com/auth/indexing"],
    null
);
// jwToken.authorize((authErr,tokens) => {
//     if (authErr) {
//       console.log("error : " + authErr);
//       return;
//     } else {
//       console.log("Authorization accorded for indexing");
//       const items = batch.map(line => {
//         return {
//           'Content-Type': 'application/http',
//           'Content-ID': '',
//           body:
//             'POST /v3/urlNotifications:publish HTTP/1.1\n' +
//             'Content-Type: application/json\n\n' +
//             JSON.stringify({
//               url: line,
//               type: 'URL_UPDATED'
//             })
//         };
//       });
//       const options = {
//         url: 'https://indexing.googleapis.com/batch',
//         method: 'POST',
//         headers: {
//           'Content-Type': 'multipart/mixed'
//         },
//         auth: { bearer: tokens.access_token },
//         multipart: items
//       };
//       request(options, (err, resp, body) => {
//         console.log(body);
//       });
//     }
// });



function indexUrl_overGoogle(url) {
    jwToken.authorize((authErr, tokens) => {
        if (authErr) {
            console.log("error : " + authErr);
            return;
        } else {
            // console.log("Authorization accorded for indexing");
            const options = {
                url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: { bearer: tokens.access_token },
                json: {
                    url: url,
                    type: 'URL_UPDATED',
                }
            }
            request(options, (err, resp, body) => {
                if(err){
                    log(err.stack, path.join(__dirname,'../error.log'))
                }
            });
        }
    });
}

module.exports=indexUrl_overGoogle