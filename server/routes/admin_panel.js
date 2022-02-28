// Admin - panel 
const otp = require('in-memory-otp');
const express = require('express');
const bcrypt = require("bcryptjs");
const { google } = require("googleapis")
const router = express.Router();
const passport = require('./passport.js')
const sendmail = require('./mail.js')
const path = require("path")
const fs = require('fs');
const log = require('log-to-file');
const bodyParser = require("body-parser");
const multer = require("multer");
const date = require("../date.js");
const reply_mail = require("../../mail_templates/reply_template.js");
const drive_cover = require("../drive_cover_folder_id.js");
const drive_pdf = require("../drive_pdf_folder_id.js");
var cloudinary = require('cloudinary');
const cookieParser = require('cookie-parser')
const _ = require("lodash");
let day = date();
const { resolve } = require('path');
const { exit } = require('process');
const sharp = require('sharp')
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})
const {sendOTP,validateOTP}=require('./otp.js')
const {client,redis_setkey}=require('./redis_conf.js')
const sendNotification=require('./notification.js')
const indexUrl_overGoogle=require('./google_indexing.js')
const {CONTACT,USER,BOOK,BOOK_UNDER_REVIEW,RESOLVED_CONTACT,DELETED_BOOK,REVIEW,FAVBOOK,MESSAGE,ADMINUSER}=require('./models.js');
const drive = require('./gdrive_setup.js')

router.get('/admin-success', (req, res) => {
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if (user) {
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        } 
                        resolve(true)
                    }
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    res.render("admin/admin_success", { user_name: req.user.name, user_image: req.user.userimage, status: "none", message: "Thanks " + req.user.name + " for your contribution !" })
                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }


    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.get('/admin/upload-edit/:book_id', (req, res) => {
    redis_setkey(req.ip+'-currloc','/admin/upload-edit/' + req.params.book_id)
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        }else{
                            resolve(true)
                        }
                    }
                })
            })
            admin_promise.then((result) => {

                if (isAdmin && isUnicode) {
                    isupt = req.query.isupt
                    if(req.params.book_id=="newbook"){
                        res.render("admin/upload_edit", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, status: "none", book: '', isupt: isupt })
                    }else{
                        BOOK.findOne({ _id: req.params.book_id }, (err, book) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                if (book) {
                                    res.render("admin/upload_edit", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, status: "none", book: book, isupt: isupt })
                                }else{
                                    res.redirect("/error")
                                }
                            }
                        })
                    }
                    
                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }


    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})




router.get('/admin/under-review',async (req, res) => {
    redis_setkey(req.ip+'-currloc', '/admin/under-review')
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        }else{
                            resolve(true)
                        }
                    }
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    if (req.query.book_id != null) {
                        BOOK_UNDER_REVIEW.find({ book_id: req.query.book_id }, (err, book_id) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                BOOK.find({}, (err, books) => {
                                    if(err){
                                        log(error, path.join(__dirname,'../error.log'))
                                    }else{
                                        res.render('admin/under_review', { 'books': books, 'under_review': book_id, status: "none" })
                                    }         
                                })
                            }
                        })
                    } else {
                        BOOK_UNDER_REVIEW.find({}, (err, books_id) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                if(books_id){
                                    BOOK.find({}, (err, books) => {
                                        if(err){
                                            log(error, path.join(__dirname,'../error.log'))
                                        }else{
                                            res.render('admin/under_review', { 'books': books, 'under_review': books_id, status: "none" })
                                        }
                                    })
                                }
                            }
                        })
                    }
                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }


    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.get('/admin/books_under_review',async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        }else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    BOOK_UNDER_REVIEW.find({}, (err, books_id) => {
                        if(err){
                            log(error, path.join(__dirname,'../error.log'))
                        }else{
                            if(books_id){ res.send(books_id) }
                        }
                    })
                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.get('/admin/add_to_review/:book_id/:category/:book_name',async (req, res) => {

    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        }else {
                            resolve(true)
                        } 
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    const book = new BOOK_UNDER_REVIEW({
                        book_id: req.params.book_id,
                        book_category: req.params.category,
                        book_name: req.params.book_name,
                        user_id: req.user.id,
                        isUpdate: true
                    })
                    book.save();
                    res.send("added")
                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
const storage = multer.diskStorage({
    filename: (req, files, cb) => {
        file_name = files.originalname;
        cb(null, file_name)
    }
})

const upload = multer({
    storage: storage,
}).fields([{ name: 'image_file', maxCount: 1 }, { name: 'pdf_file', maxCount: 1 }]);

router.post("/admin/upload-edit", upload, async(req, res) => {
    redis_setkey(req.ip+'-currloc', '/admin/upload-edit')
    try {

        book_cover_drive_link = ""
        book_cover_cloudinary_link = ""
        book_cover_cloudinary_public_id = ""
        book_cover_drive_id = ""
        pdf_file_link = ""
        pdf_file_drive_id = ""
        pdf_file_download_link = ""

        target_folder_Id = drive_pdf(req.body.category)
        source_folder_Id = ""
        const pdf_folder_Id = drive_pdf(req.body.category)
        const cover_folder_Id = drive_cover(req.body.category)

        if (req.isAuthenticated()) {

            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        } 
                        resolve(true)
                    }
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    const updatePromise = new Promise((resolve, reject) => {
                        if (req.body.book_id == "newbook") {
                            resolve(true)
                        } else {
                            BOOK.findOne({ _id: req.body.book_id }, (err, book) => {
                                if(err){
                                    log(error, path.join(__dirname,'../error.log'))
                                }else{
                                    if (book) {
                                        source_folder_Id = drive_pdf(book.book_category)
                                        book_cover_drive_link = book.book_cover_drive_link
                                        book_cover_drive_id = book.book_cover_drive_id
                                        book_cover_cloudinary_public_id = book.book_cover_cloudinary_public_id
                                        book_cover_cloudinary_link = book.book_cover_cloudinary_link
                                        pdf_file_link = book.book_file_link
                                        pdf_file_drive_id = book.book_file_drive_id
                                        pdf_file_download_link = book.book_file_download_link
                                        resolve(true)
                                    } else {
                                        res.redirect("/error")
                                        reject(new Error({ msg: err }));
                                    }
                                }
                            })
                        }
                    })
                    updatePromise.then(async function(result) {
                        if (req.body.isUpldImg == "0" && req.files.image_file == null) {
                            book_cover_drive_link = "https://drive.google.com/file/d/1X36RwEmMjtRk55-Uayp5Whw-xM5fRJ88/view?usp=sharing";
                            book_cover_drive_id = "1X36RwEmMjtRk55-Uayp5Whw-xM5fRJ88"
                            book_cover_cloudinary_link = "https://res.cloudinary.com/mybooks-webmaster/image/upload/v1631263017/books-cover/book_qlovyv.jpg"
                            book_cover_cloudinary_public_id = "book_qlovyv";
                        } else if (req.body.isUpldImg == "0" && req.files.image_file != null) {

                            await sharp(req.files.image_file[0].path).toFile(path.join(__dirname,'../tmp/tempfile.webp'))
                            const cloud_response = await cloudinary.v2.uploader.upload(path.join(__dirname,'../tmp/tempfile.webp'), { folder: "books_cover" })
                                // const cloud_response=await cloudinary.v2.uploader.upload(req.files.image_file[0].path,{ folder: "books_cover"})
                                //  console.log(cloud_response)
                            book_cover_cloudinary_public_id = cloud_response.public_id
                            book_cover_cloudinary_link = cloud_response.url
                            var cover_Metadata = {
                                'name': req.body.book_name,
                                parents: [cover_folder_Id],
                            };
                            var cover_media = {
                                mimeType: req.files.image_file[0].mimetype,
                                body: fs.createReadStream(path.join(__dirname,'../tmp/tempfile.webp'))
                                    //    body: fs.createReadStream(req.files.image_file[0].path)
                            }
                            const response = await drive.files.create({
                                resource: cover_Metadata,
                                media: cover_media,
                                supportsAllDrives: true,
                                driveID: '0AJ_wxWSWnk7tUk9PVA',
                                fields: 'id'
                            })
                            book_cover_drive_id = response.data.id
                            fileId = response.data.id
                            await drive.permissions.create({
                                fileId: fileId,
                                supportsAllDrives: true,
                                driveID: '0AJ_wxWSWnk7tUk9PVA',
                                requestBody: {
                                    role: 'reader',
                                    type: 'anyone',
                                },
                            });
                            const result = await drive.files.get({
                                fileId: fileId,
                                supportsAllDrives: true,
                                driveID: '0AJ_wxWSWnk7tUk9PVA',
                                fields: 'webViewLink, webContentLink',
                            });
                            book_cover_drive_link = result.data.webViewLink

                        }


                        if (req.files.pdf_file != null) {
                            var pdf_Metadata = {
                                'name': req.body.book_name,
                                parents: [pdf_folder_Id],
                            };
                            var pdf_media = {
                                mimeType: req.files.pdf_file[0].mimetype,
                                body: fs.createReadStream(req.files.pdf_file[0].path)
                            };

                            const response = await drive.files.create({
                                resource: pdf_Metadata,
                                media: pdf_media,
                                supportsAllDrives: true,
                                driveID: '0AJ_wxWSWnk7tUk9PVA',
                                fields: 'id'
                            })
                            pdf_file_drive_id = response.data.id
                            fileId = response.data.id
                            await drive.permissions.create({
                                fileId: fileId,
                                supportsAllDrives: true,
                                driveID: '0AJ_wxWSWnk7tUk9PVA',
                                requestBody: {
                                    role: 'reader',
                                    type: 'anyone',
                                },
                            });
                            const result = await drive.files.get({
                                fileId: fileId,
                                supportsAllDrives: true,
                                driveID: '0AJ_wxWSWnk7tUk9PVA',
                                fields: 'webViewLink, webContentLink',
                            });
                            pdf_file_link = result.data.webViewLink
                            pdf_file_download_link = result.data.webContentLink
                        }


                        searchTag = req.body.book_name + "-" + req.body.author_name + "-" + req.body.category + "-" + req.body.sub_category + "-" + req.body.tags
                        searchTag = _.trim(_.toLower(searchTag)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '');
                        if (req.body.book_id == "newbook") {
                            const book = new BOOK({
                                book_name: req.body.book_name,
                                author_name: req.body.author_name,
                                book_description: req.body.description,
                                book_category: req.body.category,
                                book_subcategory: req.body.sub_category,
                                book_cover_drive_link: book_cover_drive_link,
                                book_cover_drive_id: book_cover_drive_id,
                                book_cover_cloudinary_public_id: book_cover_cloudinary_public_id,
                                book_cover_cloudinary_link: book_cover_cloudinary_link,
                                book_file_link: pdf_file_link,
                                book_file_drive_id: pdf_file_drive_id,
                                book_file_download_link: pdf_file_download_link,
                                tags: req.body.tags,
                                searchTag: searchTag,
                                uploader_name: req.user.name,
                                uploader_id: req.user.id,

                            })
                            book.save(function(err, saved_book) {
                                if(err){
                                    log(error, path.join(__dirname,'../error.log'))
                                }else{
                                    under_review = new BOOK_UNDER_REVIEW({
                                        book_id: saved_book.id,
                                        book_category: req.body.category,
                                        user_id: req.user.id,
                                        book_name: req.body.book_name,
                                        isUpdate: false
                                    })
                                    under_review.save();
                                }
                            });
                            USER.findOneAndUpdate({ _id: req.user.id }, { $inc: { booksUploaded: 1 } }, { new: true }, (err, user) => { if (err) {  } })

                        } else {
                            BOOK.findOne({ _id: req.body.book_id }, async(err, book) => {
                                if (!err) {
                                    if(book){
                                        await drive.files.update({
                                            fileId: book.book_file_drive_id,
                                            supportsAllDrives: true,
                                            driveID: '0AJ_wxWSWnk7tUk9PVA',
                                            addParents: target_folder_Id,
                                            removeParents: source_folder_Id,
                                        })
                                    }
                                } else {
                                    log(error, path.join(__dirname,'../error.log'))
                                }
                            }).then(() => {
                                BOOK.updateOne({ _id: req.body.book_id }, {
                                    $set: {
                                        book_name: req.body.book_name,
                                        author_name: req.body.author_name,
                                        book_description: req.body.description,
                                        book_category: req.body.category,
                                        book_subcategory: req.body.sub_category,
                                        book_cover_drive_link: book_cover_drive_link,
                                        book_cover_drive_id: book_cover_drive_id,
                                        book_cover_cloudinary_public_id: book_cover_cloudinary_public_id,
                                        book_cover_cloudinary_link: book_cover_cloudinary_link,
                                        book_file_link: pdf_file_link,
                                        book_file_drive_id: pdf_file_drive_id,
                                        book_file_download_link: pdf_file_download_link,
                                        tags: req.body.tags,
                                        searchTag: searchTag,
                                        updatedAt: Date.now(),
                                        updatedId: req.user.id,
                                    }
                                }, (err) => {
                                    if (err) {
                                        log(error, path.join(__dirname,'../error.log'))
                                    } else {
                                        under_review = new BOOK_UNDER_REVIEW({
                                            book_id: req.body.book_id,
                                            book_category: req.body.category,
                                            user_id: req.user.id,
                                            book_name: req.body.book_name,
                                            isUpdate: true
                                        })
                                        BOOK_UNDER_REVIEW.findOne({ book_id: req.body.book_id }, (err, isbook) => {
                                            if (!isbook) {
                                                under_review.save();
                                            }
                                        })
                                    }
                                })
                            })


                        }
                    })

                    res.send("ok")
                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})


router.post('/admin/reply',async (req, res) => {
    
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        } else {
                            resolve(true)
                        } 
                    }
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    length = 0
                    const contact_promise = new Promise((resolve, reject) => {
                        CONTACT.find({}, (err, msgs) => {
                            if (!err) {
                                length = msgs.length
                                resolve(true)
                            } else {
                                log(error, path.join(__dirname,'../error.log'))
                            }
                        })
                    })
                    contact_promise.then((result) => {

                        CONTACT.findOne({ _id: req.body.client_mailId }, (err, contact) => {
                            if (!err) {

                                resolved_contact = new RESOLVED_CONTACT({
                                    name: contact.name,
                                    email: contact.email,
                                    message: contact.message,
                                })
                                resolved_contact.save();
                                contact.remove();
                                day = date();
                                const message = new MESSAGE({
                                    msg: '(Reply from team) - ' + req.body.reply,
                                    time: day
                                })
                                sendNotification("(Reply from team) ", req.body.reply, req.body.client_ID)

                                USER.findOne({ _id: req.body.client_ID }, (err, user) => {
                                    if(err){
                                        log(error, path.join(__dirname,'../error.log'))
                                    }else{
                                        if (user) {
                                            user.notifications.push(message);
                                            user.save();
                                        }
                                    }
                                })
                                sendmail(req.body.client_mail, 'Reply from (mybooks)', '', reply_mail(req.body.reply))

                                res.send({ status: 'reply_sent', length: length })
                                USER.findOneAndUpdate({ username: req.user.username }, { $inc: { q_resolved: 1 } }, { new: true }, (err, user) => { if (err) {  } })
                                USER.findOneAndUpdate({ username: req.user.username }, { $inc: { credits: 1.5 } }, { new: true }, (err, user) => { if (err) {  } })
                            }
                        })

                    })

                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }


    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.delete('/admin/removemsg/:msgID',async (req, res) => {
    
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        } else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    length = 0
                    const contact_promise = new Promise((resolve, reject) => {
                        CONTACT.find({}, (err, msgs) => {
                            if (!err) {
                                length = msgs.length
                                resolve(true)
                            } else {
                                log(error, path.join(__dirname,'../error.log'))
                            }
                        })
                    })
                    contact_promise.then((result) => {

                        CONTACT.findOne({ _id: req.params.msgID }, (err, contact) => {
                            if (!err) {
                                contact.remove();
                                res.send({ status: 'removed', length: length })
                            }else{
                                log(error, path.join(__dirname,'../error.log'))
                            }
                        })

                    })

                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }


    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.get('/admin/get_more_books',async (req, res) => {
    
    try {
        if (req.isAuthenticated()) {
            let { page } = req.query;

            if (req.query.searchtag == null) {
                search_item = "All books"
                search_Tag = "All books"
            } else {
                search_item = req.query.searchtag
                search_Tag = req.query.searchtag
            }

            search_item = _.trim(_.toLower(search_item)).replace(/[&\/\\#,+()$~%.`'":*?<>{} ]/g, '');

            page = parseInt(page)
            const skip = (page - 1) * 14;
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        } else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    if (search_Tag == "All books") {
                        BOOK.find({}).limit(14).skip(skip).exec((err, books) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                res.send(books)
                            }
                        })
                    } else {
                        BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).limit(14).skip(skip).exec((err, books) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                res.send(books)
                            }
                        })
                    }
                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.get('/admin', async(req, res) => {
    redis_setkey(req.ip+'-currloc', "/admin")

    try {
        if (req.query.searchtag == null) {
            search_item = "All books"
            search_Tag = "All books"
        } else {
            search_item = req.query.searchtag
            search_Tag = req.query.searchtag
        }
        search_item = _.trim(_.toLower(search_item)).replace(/[&\/\\#,+()$~%.`'":*?<>{} ]/g, '');
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        } else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {

                    if (search_Tag == "All books") {
                        BOOK.find({}).limit(14).exec((err, books) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                res.render("admin/admin", { user_name: req.user.name, user_image: req.user.userimage, username: req.user.username, user_id: req.user.id, status: "none", searchtag: search_Tag, books: books })
                            }
                        })
                    } else {
                        BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).limit(14).exec((err, books) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                res.render("admin/admin", { user_name: req.user.name, user_image: req.user.userimage, username: req.user.username, user_id: req.user.id, status: "none", searchtag: search_Tag, books: books })
                            }
                        })
                    }

                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.get('/admin-advanced_search',async (req, res) => {
    searchTag = req.query.sub_category
    res.redirect("/admin/?page=1&searchtag=" + searchTag)
})
router.patch('/admin/addmember/:id',async (req, res) => {

    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        }else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    searchtag = ""
                    usermail = ""
                    const user_promise = new Promise((resolve, reject) => {
                        USER.findOne({ _id: req.params.id }, (err, user) => {
                            if (!err) {
                                if(user){
                                    searchtag += user.searchtag;
                                    usermail = user.username;
                                } 
                                resolve(true)
                            }else{
                                log(error, path.join(__dirname,'../error.log'))
                            }
                        })
                    })
                    user_promise.then((result) => {
                        USER.updateOne({ _id: req.params.id }, { $set: { ismember: true, searchtag: searchtag + "-member" } }, (err) => {
                            if (!err) {
                                if(user){
                                    sendNotification("(Message from team) ", "Dear, your are now member of our platform. Your all activity on our platform will be recorded by us. Once you upload a book it will increment your credits, your referral link can also increment your credits if anybody signup with that link. Based on these credits you will be paid. Kindly acknowledge this mail for confirmation. Thanks for becoming our member !!.", req.params.id)
                                    sendmail(usermail, 'Congrats for becoming our member', '', reply_mail("Dear, your are now member of our platform. Your all activity on our platform will be recorded by us. Once you upload a book it will increment your credits, your referral link can also increment your credits if anybody signup with that link. Based on these credits you will be paid. Kindly acknowledge this mail for confirmation. Thanks for becoming our member !!.")).catch((error) => log(error, path.join(__dirname,'../error.log')));
                                    res.send("updated")
                                }
                            }else{
                                log(error, path.join(__dirname,'../error.log'))
                            }
                        })
                    })
                } else {
                    res.send("unauthorized")
                }
            })
        } else {
            res.send("unauthorized")
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.delete('/admin/removemember/:id',async (req, res) => {
    
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        } else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    searchtag = ""
                    usermail = ""
                    const user_promise = new Promise((resolve, reject) => {
                        USER.findOne({ _id: req.params.id }, (err, user) => {
                            if (!err) {
                                if(user){
                                    searchtag += _.trim(_.toLower(user.name)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '') + "-" + user.username;
                                    usermail = user.username;
                                    resolve(true)
                                }
                            }else{
                                log(error, path.join(__dirname,'../error.log'))
                            }
                        })
                    })
                    user_promise.then((result) => {
                        USER.updateOne({ _id: req.params.id }, { $set: { ismember: false, searchtag: searchtag } }, (err) => {
                            if (!err) {
                                sendNotification("(Message from team) ", "Dear, your member access from our platform has been removed. If you have any pending payments kindly reply to our support team. Thank you for being our member !!.", req.params.id)
                                sendmail(usermail, 'Sorry you will no longer our member (myBooks)', '', reply_mail("Dear, your member access from our platform has been removed. If you have any pending payments kindly reply to our support team. Thank you for being our member !!.")).catch((error) => log(error, path.join(__dirname,'../error.log')));
                                res.send("updated")
                            }else{
                                log(error, path.join(__dirname,'../error.log'))
                            }
                        })
                    })
                } else {
                    res.send("unauthorized")
                }
            })
        } else {
            res.send("unauthorized")
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})
router.delete('/admin/removeadmin/:id/:key',async (req, res) => {
   
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        }else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    searchtag = ""
                    const user_promise = new Promise((resolve, reject) => {
                        USER.findOne({ _id: req.params.id }, (err, user) => {
                            if (!err) {
                                if(user){
                                    searchtag += _.trim(_.toLower(user.name)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '') + "-" + user.username;
                                    resolve(true)
                                }
                            }else{
                                log(error, path.join(__dirname,'../error.log'))
                            }
                        })
                    })
                    user_promise.then((result) => {
                        USER.updateOne({ _id: req.params.id }, { $set: { ismember: false, searchtag: searchtag, unicode: null } }, (err) => {
                            if (!err) {
                                sendmail(usermail, 'Sorry you will no longer admin (myBooks)', '', reply_mail("Dear, your admin access from our platform has been removed. If you have any pending payments kindly reply to our support team. Thank you for being our member !! .")).catch((error) => log(error, path.join(__dirname,'../error.log')));
                                res.send("updated")
                            }else{
                                log(error, path.join(__dirname,'../error.log'))
                            }
                        })
                    })
                } else {
                    res.send("unauthorized")
                }
            })
        } else {
            res.send("unauthorized")
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.delete('/delete/:book_id', (req, res) => {

    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        }else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    BOOK.findOne({ _id: req.params.book_id }, async(err, book) => {
                        if(err){
                            log(error, path.join(__dirname,'../error.log'))
                        }else{  
                            if(book){
                                const result = await drive.files.delete({
                                    fileId: book.book_file_drive_id,
                                    supportsAllDrives: true,
                                    driveID: '0AJ_wxWSWnk7tUk9PVA',
                                });
    
                                deleted_book = new DELETED_BOOK({
                                    book_name: book.book_name,
                                    author_name: book.author_name,
                                    book_description: book.book_description,
                                    book_category: book.book_category,
                                    book_subcategory: book.book_subcategory,
                                    book_cover_drive_link: book.book_cover_drive_link,
                                    book_cover_drive_id: book.book_cover_drive_id,
                                    book_cover_cloudinary_public_id: book.book_cover_cloudinary_public_id,
                                    book_cover_cloudinary_link: book.book_cover_cloudinary_link,
                                    book_file_link: book.book_file_link,
                                    book_file_drive_id: book.book_file_drive_id,
                                    book_file_download_link: book.book_file_download_link,
                                    tags: book.tags,
                                    searchTag: book.searchTag,
                                    uploader_name: book.uploader_name,
                                    uploader_id: book.uploader_id,
                                    admin_userID: req.user.id,
                                });
                                deleted_book.save();
                                book.remove();
                                BOOK_UNDER_REVIEW.findOne({ book_id: req.params.book_id }, (err, rwbook) => {
                                    if (!err) {
                                        rwbook.remove();
                                    }
                                })
                                res.send("deleted")
                                USER.findOne({ _id: book.uploader_id }, (err, user) => {
                                    if(user){
                                        sendmail(user.username, 'Message from team', '', reply_mail("Dear " + book.uploader_name + ", The book you have uploaded named-" + book.book_name + " does not follow our guidelines so kindy re-upload it with correct details."))
                                        sendNotification("Message from team", "Dear " + book.uploader_name + ", The book you have uploaded named-" + book.book_name + " does not follow our guidelines so kindy re-upload it with correct details.", book.uploader_id)
                                    }    
                                })
                            }  
                        }
                    })
                } else {
                    res.send("unauthorized")
                }
            })
        } else {
            res.send("unauthorized")
        }


    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.delete('/delete_under_review/:book_id',async (req, res) => {

    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true
                                    }
                                    resolve(true)
                                })
                            })
                        }else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    BOOK_UNDER_REVIEW.findOne({ book_id: req.params.book_id }, (err, book) => {
                        if (!err) {
                            if(book){
                                if (!book.isUpdate) {
                                    if (book.book_category == "Nover or Fiction" || book.book_category == "Others") {
                                        USER.findOneAndUpdate({ _id: book.user_id }, { $inc: { credits: 0.5 } }, { new: true }, (err, user) => { if (err) {  } })
                                    } else {
                                        USER.findOneAndUpdate({ _id: book.user_id }, { $inc: { credits: 1 } }, { new: true }, (err, user) => { if (err) {  } })
                                    }
                                    sendNotification("Message from team", "Your book named '" + book.book_name + "' has been reviewed successfully and credits also got added to your account.", book.user_id)
                                }
                                book.remove();
                                indexUrl_overGoogle("https://mybooks-free.com/book/" + book.book_name)
                            }
                        }else{
                            log(error, path.join(__dirname,'../error.log'))
                        }
                    })
                    BOOK_UNDER_REVIEW.find({}, (err, books) => {
                        if(err){
                            log(error, path.join(__dirname,'../error.log'))
                        }else{
                            res.send({ "length": books.length })
                        }
                    })
                } else {
                    res.send("unauthorized")
                }
            })
        } else {
            res.send("unauthorized")
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.get('/admin/messages',async (req, res) => {

    try {
        redis_setkey(req.ip+'-currloc', '/admin/messages')

        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true  
                                    }
                                    resolve(true)
                                })
                            })
                        } else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    CONTACT.find({}, (err, contacts) => {
                        res.render('admin/admin_messages', { status: "none", contacts: contacts })
                    })
                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.post('/admin/edit_user/:id',async (req, res) => {

    try {
        if (req.isAuthenticated()) {
            currentAdmin = req.user.username
            if (currentAdmin == "ankitkohli181@gmail.com" || currentAdmin == "ankitkholi2002@gmail.com" || currentAdmin == "mybooks.webmaster@gmail.com") {
                console.log("user-edit")
                USER.findOneAndUpdate({ _id: req.params.id }, { $set: { credits: req.body.credits } }, { new: true }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if (user) {
                            res.send(user)
                        } else {
                            res.send("unauthorized")
                        }
                    }
                })
            } else {
                res.send("unauthorized")
            }
        } else {
            res.send("unauthorized")
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.post('/admin/notify_user/:id',async (req, res) => {

    try {
        if (req.isAuthenticated()) {
            day = date();
            const message = new MESSAGE({
                msg: req.body.message,
                time: day
            })
            USER.findOne({ _id: req.params.id }, (err, user) => {
                if(err){
                    log(error, path.join(__dirname,'../error.log'))
                }else{ 
                    if (user) {
                        user.notifications.push(message);
                        user.save();
                        console.log("notification added")
                        sendNotification("Message from team", req.body.message, req.params.id)
                        sendmail(user.username, 'Message from team', '', reply_mail(req.body.message))

                        res.send("sent")
                    }
                }
            })

        } else {
            res.send("unauthorized")
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.delete('/user/remove_msg/:msgID',async (req, res) => {

    try {
        if (req.isAuthenticated()) {

            USER.findOneAndUpdate({ _id: req.user.id }, { $pull: { notifications: { _id: req.params.msgID } } }, { new: true }, function(err, user) {
                if(err){
                    log(error, path.join(__dirname,'../error.log'))
                }else{
                    if (user) {
                        if (user.notifications.length == 0) {
                            res.send("deleted_empty")
                        } else {
                            res.send("deleted")
                        }
                    } else {
                        res.send("unauthorized")
                    }
                }
            });

        } else {
            res.send("unauthorized")
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.get('/admin/get_more_user',async (req, res) => {

    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true  
                                    }
                                    resolve(true)
                                })
                            })
                        } else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {

                    let { page } = req.query;
                    page = parseInt(page)
                    const skip = (page - 1) * 5;
                    let { searchtag } = req.query
                    searchtag = _.trim(_.toLower(searchtag)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '')
                    if (searchtag == "allusers" || searchtag == "") {
                        USER.find({}).limit(5).skip(skip).exec((err, members) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                if(members){
                                    res.send(members)
                                }
                            }
                        })
                    } else {
                        USER.find({ searchtag: { $regex: searchtag, $options: '$i' } }).limit(5).skip(skip).exec((err, members) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                if(members){
                                    res.send(members)
                                }
                            }
                        })
                    }
                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.get('/admin/members',async (req, res) => {
    
    try {
        redis_setkey(req.ip+'-currloc', '/admin/members')

        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            const admin_promise = new Promise((resolve, reject) => {
                USER.findOne({ username: req.user.username }, (err, user) => {
                    if(err){
                        log(error, path.join(__dirname,'../error.log'))
                    }else{
                        if(user){
                            bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                                if (result) {
                                    isUnicode = true
                                }
                                bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                    if (result) {
                                        isAdmin = true  
                                    }
                                    resolve(true)
                                })
                            })
                        } else {
                            resolve(true)
                        }
                    } 
                })
            })
            admin_promise.then((result) => {
                if (isAdmin && isUnicode) {
                    let { searchtag } = req.query
                    searchtag = _.trim(_.toLower(searchtag)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '')
                    if (searchtag == "allusers" || searchtag == "") {
                        USER.find({}).limit(5).exec((err, members) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                if(members){
                                    res.render('admin/members_detail', { status: "none", members: members, currentAdmin: req.user.username, searchtag: "allusers" })
                                }
                            }
                        })
                    } else {
                        USER.find({ searchtag: { $regex: searchtag, $options: '$i' } }).limit(5).exec((err, members) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                if(members){
                                    res.render('admin/members_detail', { status: "none", members: members, currentAdmin: req.user.username, searchtag: searchtag })
                                }
                            }
                        })
                    }
                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
                }
            })
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})



router.get('/admin-login', (req, res) => {
    if (req.isAuthenticated()) {
        unicode = req.cookies['mybooks_unicode']
        adminkey = req.cookies['mybooks_adminkey']
        var isUnicode = false
        var isAdmin = false
        const admin_promise = new Promise((resolve, reject) => {
            USER.findOne({ username: req.user.username }, (err, user) => {
                if(err){
                    log(error, path.join(__dirname,'../error.log'))
                }else{
                    if (user) {
                        bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                            if (result) {
                                isUnicode = true
                            }
                            bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                if (result) {
                                    isAdmin = true
                                    resolve(true)
                                }
                            })
                        })
                    } else {
                        resolve(true)
                    }
                }
            })
        })
        admin_promise.then((result) => {
            if (isAdmin && isUnicode) {
                res.redirect("/admin")

            } else {
                res.render("admin/admin_login", { message: "", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
            }
        })
    } else {
        res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
    }

})

router.get('/admin-login-err', (req, res) => {

    if (req.isAuthenticated()) {
        unicode = req.cookies['mybooks_unicode']
        adminkey = req.cookies['mybooks_adminkey']
        var isUnicode = false
        var isAdmin = false
        const admin_promise = new Promise((resolve, reject) => {
            USER.findOne({ username: req.user.username }, (err, user) => {
                if(err){
                    log(error, path.join(__dirname,'../error.log'))
                }else{
                    if (user) {
                        bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                            if (result) {
                                isUnicode = true
                            }
                            bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                if (result) {
                                    isAdmin = true
                                }
                                resolve(true)
                            })
                        })
                    } else {
                        resolve(true)
                    }
                }
            })
        })
        admin_promise.then((result) => {
            if (isAdmin && isUnicode) {
                res.redirect("/admin")

            } else {
                res.render("admin/admin_login", { message: "Unauthorized access to the database !!", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
            }
        })
    } else {
        res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
    }
})

router.get('/admin-login_invalid_password', (req, res) => {
    if (req.isAuthenticated()) {
        unicode = req.cookies['mybooks_unicode']
        adminkey = req.cookies['mybooks_adminkey']
        var isUnicode = false
        var isAdmin = false
        const admin_promise = new Promise((resolve, reject) => {
            USER.findOne({ username: req.user.username }, (err, user) => {
                if(err){
                    log(error, path.join(__dirname,'../error.log'))
                }else{
                    if (user) {
                        bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                            if (result) {
                                isUnicode = true
                            }
                            bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                if (result) {
                                    isAdmin = true
                                }
                                resolve(true)
                            })
                        })
                    } else {
                        resolve(true)
                    }
                }
            })
        })
        admin_promise.then((result) => {
            if (isAdmin && isUnicode) {
                res.redirect("/admin")

            } else {
                res.render("admin/admin_login", { message: "Wrong password", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
            }
        })
    } else {
        res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
    }

})

router.get('/admin-signup', (req, res) => {

    if (req.isAuthenticated()) {
        unicode = req.cookies['mybooks_unicode']
        adminkey = req.cookies['mybooks_adminkey']
        var isUnicode = false
        var isAdmin = false
        const admin_promise = new Promise((resolve, reject) => {
            USER.findOne({ username: req.user.username }, (err, user) => {
                if(err){
                    log(error, path.join(__dirname,'../error.log'))
                }else{
                    if (user) {
                        bcrypt.compare(req.user.unicode, unicode, (err, result) => {
                            if (result) {
                                isUnicode = true
                            }
                            bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                if (result) {
                                    isAdmin = true
                                }
                                resolve(true)
                            })
                        })
                    } else {
                        resolve(true)
                    }
                }
            })
        })
        admin_promise.then((result) => {
            if (isAdmin && isUnicode) {
                res.render("admin/admin_signup", { message: "", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
            } else {
                res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
            }
        })
    } else {
        res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
    }

})


router.post("/admin_access/:email", async(req, res) => {
    try {
        if (req.isAuthenticated() && req.params.email == req.user.username) {
            otp.startOTPTimer(new Date().getTime());
            otp.setOTPDigits(4);

            await sendOTP(req.params.email, otp.generateOTP(req.params.email, 10), "OTP for Admin access of your account on mybooks")

            res.send("ok")
        } else {
            res.send("notfound")
        }
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }


})

router.post("/admin_register", (req, res) => {

    otp.startOTPTimer(new Date().getTime());
    otp.setOTPDigits(4);
    sendOTP(req.params.email, otp.generateOTP(req.params.email, 10), "OTP for registering new admin")

})

router.post('/admin-signup', (req, res) => {
    try {
        var OTP = Number(req.body.otp)
        const signupPromise = new Promise((resolve, reject) => {
            ADMINUSER.findOne({ username: req.body.username }, (err, admin) => {
                if (admin) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
        signupPromise.then(async function(result) {
            if (await validateOTP(req.body.username, req.body.otp) || otp.validateOTP('ankitkohli181@gmail.com', OTP)) {
                if (req.body.adminkey == process.env.ADMIN_KEY) {
                    tmpuser = "";
                    const tmpuserPromise = new Promise((resolve, reject) => {
                        USER.findOne({ username: req.body.username }, (err, user) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                if (user) {
                                    tmpuser = user.name;
                                    resolve(true);
                                }
                            }
                        })
                    })
                    tmpuserPromise.then((result) => {
                        USER.findOneAndUpdate({ username: req.body.username }, { $set: { unicode: req.body.unicode, ismember: true, searchtag: _.trim(_.toLower(tmpuser)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '') + "-" + req.body.username + "-admin-member" } }, (err, user) => {
                            if(err){
                                log(error, path.join(__dirname,'../error.log'))
                            }else{
                                if (user) {
                                    sendmail('ankitkohli181@gmail.com', 'New admin registered in (mybooks)', 'new-admin-unicode :' + req.body.unicode + ' , ' + 'new-admin-email :' + req.body.username, "")

                                    sendmail(req.body.username, 'Admin Details from (mybooks)', '', reply_mail("Thanks for becoming our team member , your unicode is- " + req.body.unicode + ". Use this code while login into your admin's panel"))

                                    const admin = new ADMINUSER({
                                        username: req.body.username,
                                        userID: user.id,
                                        unicode: req.body.unicode
                                    })
                                    admin.save()
                                    USER.updateOne({ username: req.body.username }, { $unset: { tmp_otp: "" } }, (err) => {
                                        if (err) {
                                            log(error, path.join(__dirname,'../error.log'))
                                        } else {
                                            clearTimeout(otpTimer)
                                        }
                                    })
                                    res.send({ message: "Successfully registered the user as admin" })

                                } else {
                                    res.send({ message: "This user still not signedUp", status: "401" })
                                }
                            }
                        })
                    })
                } else {
                    res.send({ message: "Unauthorized access !! enter correct key", status: "401" })
                }
            } else {
                res.send({ message: "Error !! please enter correct OTP", status: "401" })
            }
        })
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.post('/admin-login', (req, res) => {
    try {
        var OTP = Number(req.body.otp)
        const signupPromise = new Promise((resolve, reject) => {
            ADMINUSER.findOne({ username: req.body.username }, (err, admin) => {
                if(err){
                    log(error, path.join(__dirname,'../error.log'))
                }else{
                    if (admin) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }
            })
        })
        signupPromise.then(async function(result) {

            if (await (req.body.username, req.body.otp) || otp.validateOTP(req.body.username, OTP)) {
                if (req.body.adminkey == process.env.ADMIN_KEY) {
                    USER.findOne({ username: req.body.username }, (err, user) => {
                        if(err){
                            log(error, path.join(__dirname,'../error.log'))
                        }else{
                            if (user) {
                                if (user.unicode == req.body.unicode) {

                                    sendmail('ankitkohli181@gmail.com', 'admin logged in (mybooks)', 'admin-name -' + req.user.name + ' , ' + 'admin-email -' + req.body.username, "")

                                    bcrypt.hash(req.body.unicode, 5, (err, Unicode) => {
                                        bcrypt.hash(req.body.adminkey, 5, (err, adminKey) => {
                                            if (!err) {
                                                res.cookie('mybooks_unicode', Unicode, { maxAge: 1.2960E+9 })
                                                res.cookie('mybooks_adminkey', adminKey, { maxAge: 1.2960E+9 })
                                                USER.updateOne({ username: req.body.username }, { $unset: { tmp_otp: "" } }, (err) => {
                                                    if (err) {
                                                        log(error, path.join(__dirname,'../error.log'))
                                                    } else {
                                                        clearTimeout(otpTimer)
                                                    }
                                                })
                                                client.get(req.ip+'-currloc', function(err, response) {
                                                    if(err){ 
                                                        log(error, path.join(__dirname,'../error.log'))
                                                        res.send({ message: "Login successful, Redirecting...", status: "200", authUrl: '/home' })
                                                    }else{
                                                        if(response==""){
                                                            res.send({ message: "Login successful, Redirecting...", status: "200", authUrl: "/admin" })
                                                        }else{
                                                            res.send({ message: "Login successful, Redirecting...", status: "200", authUrl: response })
                                                        }
                                                    }
                                                });
                                            }
                                        })
                                    })
                                } else {
                                    res.send({ message: "Wrong credentials try to enter correct unicode", status: "401" })
                                }

                            } else {
                                res.send({ message: "Wrong credentials try to enter correct username", status: "401" })
                            }
                        }
                    })
                        
                } else {
                    res.send({ message: "Unauthorized access !! enter correct key", status: "401" })
                }
            } else {
                res.send({ message: "Error !! please enter correct OTP", status: "401" })
            }

        })
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.get('/request_access', (req, res) => {
    sendmail('ankitkohli181@gmail.com', 'Requesting admin access', 'username -' + req.user.username, "")
})


module.exports=router