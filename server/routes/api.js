// API 
const express = require('express');
const {client,redis_setkey}=require('./redis_conf.js')
const _ = require("lodash");
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

module.exports=router