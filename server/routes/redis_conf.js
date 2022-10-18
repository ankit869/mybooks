const redis = require('redis');
const log = require('log-to-file');
const schedule = require('node-schedule');
https://app.redislabs.com/ for cloud redis-data

// client = redis.createClient({
//      host: ""
//     ,port: ""
//     ,auth_pass:""
// });

client = redis.createClient({
     host: 'containers-us-west-28.railway.app'
    ,port: 8051
    ,auth_pass:'WOSi1pbSOUGoocsEAYqU'
});

// schedule.scheduleJob("*/60 * * * *",async function() {
//     client.flushdb( function (err, succeeded) {
//         if(err){
//             log(err, path.join(__dirname,'../error.log'))
//         } // will be true if successfull
//     });
// });

// const client = redis.createClient();

// client.connect(); //for new versions 

// client.on('connect', function(){
//     console.log('Connected to Redis...');
// });


async function redis_setkey(key,value,expire=60*10){
    client.set(key,value);
    client.expire(key,expire);
}
async function redis_getkey(key){
    return new Promise(function(resolve,reject){
            client.get(key,(err,response)=>{
            if(response) resolve(response);
        });
    });
}
async function redis_setotp(key,value){
    client.set(key,value);
    client.expire(key,60*10);
}

module.exports ={client,redis_setkey,redis_setotp,redis_getkey}

