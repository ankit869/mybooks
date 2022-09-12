// API 
const express = require('express');
const {client,redis_setkey}=require('./redis_conf.js')
const _ = require("lodash");
var rand = require("random-key");
const router = express.Router();
const {USER,BOOK,APIUSER}=require('./models.js');
const sendNotification=require('./notification.js')
const reply_mail = require("../../mail_templates/reply_template.js");
const sendmail = require('./mail.js')
const log = require('log-to-file');
const path = require("path")
async function api_requests(key) {
    APIUSER.updateOne({ "api_key": key }, { $inc: { "api_requests": 1 } }, { new: true }, (err) => { if (err) {  } })
}

router.get('/api/:key/:parameter', (req, res) => {

    search_item = _.trim(_.toLower(req.params.parameter)).replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g, '');
    APIUSER.findOne({ "api_key": req.params.key }, (err, user) => {
        if(err){
            log(err, path.join(__dirname,'../error.log'))
        }else{
            if (user) {
                if (user.api_status=="enabled") {
                    BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).exec((err, books) => {
                        if(err){
                            log(err, path.join(__dirname,'../error.log'))
                        }else{
                            api_requests(req.params.key)
                            BOOKS = []
                            books.forEach((book) => {
                                categories=[]
                                book.category.forEach((ctgry) => {
                                    categories.push({
                                        category:ctgry.book_category,
                                        subcategory:ctgry.book_subcategory
                                    })
                                })
                                book = {
                                    title: book.book_name,
                                    authors: book.author,
                                    description: book.book_description,
                                    categories: categories,
                                    thumbnail: book.book_cover_cloudinary_link,
                                    file_link: book.book_file_download_link
                                }
                                BOOKS.push(book)
                            })
                            res.send(BOOKS)
                        }
                    })
                } else {
                    res.send("Your API-KEY is currently disabled")
                }
            } else {
                res.send("ERROR !! Please try again with correct api key")
            }
        }
    })
})
router.get('/api/getbooks', (req, res) => {
    key = req.header('api-key')
    parameter = req.header('parameter')
    search_item = _.trim(_.lowerCase(_.toLower(parameter))).replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g, '');
    APIUSER.findOne({ "api_key": req.params.key }, (err, user) => {
        if(err){
            log(err, path.join(__dirname,'../error.log'))
        }else{
            if (user) {
                if (user.api_status=="enabled") {
                    BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).exec((err, books) => {
                        if(err){
                            log(err, path.join(__dirname,'../error.log'))
                        }else{
                            api_requests(key)
                            BOOKS = []
                            books.forEach((book) => {
                                categories=[]
                                book.category.forEach((ctgry) => {
                                    categories.push({
                                        category:ctgry.book_category,
                                        subcategory:ctgry.book_subcategory
                                    })
                                })
                                book = {
                                    title: book.book_name,
                                    authors: book.author,
                                    description: book.book_description,
                                    categories: categories,
                                    thumbnail: book.book_cover_cloudinary_link,
                                    file_link: book.book_file_download_link
                                }
                                BOOKS.push(book)
                            })
                            res.send(BOOKS)
                        }
                    })
                } else {
                    res.send("Your API-KEY is currently disabled")
                }
            } else {
                res.send("ERROR !! Please try again with correct api key")
            }
        }
    })
})


router.patch('/api/toggle',async (req, res) => {
    if (req.isAuthenticated()) {
        let apiuser=await APIUSER.findOne({userId:req.user.id});
            
        if(apiuser){
            if(apiuser.api_status=="enabled") {
                apiuser.api_status="disabled";
                apiuser.save()
                USER.updateOne({_id:req.user.id},{ $set: { searchtag: req.user.searchtag.replace('-apiuser-apienabled-apiclient', '-apiuser-apidisabled-apiclient')}}).then(()=>{
                    res.send("disabled")
                })
            }else{
                apiuser.api_status="enabled";
                apiuser.save()
                USER.updateOne({_id:req.user.id},{ $set: { searchtag: req.user.searchtag.replace('-apiuser-apidisabled-apiclient', '-apiuser-apienabled-apiclient')}}).then(()=>{
                    res.send(apiuser.api_key)
                })
            }
        }else{
            
            API_KEY = rand.generate(30)
            newApiUser=new APIUSER({
                userId:req.user.id,
                api_key:API_KEY
            })

            USER.updateOne({_id:req.user.id},{ $set: { searchtag: req.user.searchtag+'-apiuser-apienabled-apiclient'}}).then(()=>{
                newApiUser.save().then(()=>{
                    res.send(API_KEY)
                });
            })
        }
            
    } else {
        res.send("unauthorized")
    }
})

router.get('/api',async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', '/api')
        if (req.isAuthenticated()) {
            let apiuser=await APIUSER.findOne({userId:req.user.id});
            if(apiuser){
                res.render("webapps/api", { api_user: apiuser})
            }else{
                res.render("webapps/api", { api_user: "" });
            } 
        } else {
            res.render("webapps/api", { api_user: "not_a_user" });
        } 
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/private/api_detail',async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            let apiuser=await APIUSER.findOne({ userId: req.user.id }); 
            if(apiuser){ res.send(apiuser) }
            else{ res.send("user not found")}
        } else {
            res.send("unauthorized")
        }
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

module.exports=router