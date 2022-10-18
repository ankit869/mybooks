
const express = require('express');
const fs = require('fs');
const log = require('log-to-file');
const router = express.Router();
module.exports=(io,passport,sessionMiddleware)=>{
    
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));

    io.use((socket, next) => {
        if (socket.request.user) {
          next();
        } else {
          next(new Error('unauthorized'))
        }
    });
    
     
    io.on('connection', async function(socket) {
        socket.emit("user",socket.request.user)
    })

    return(router)
}