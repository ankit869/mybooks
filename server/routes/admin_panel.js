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
const {client,redis_setkey,redis_setotp}=require('./redis_conf.js')
const sendNotification=require('./notification.js')
const indexUrl_overGoogle=require('./google_indexing.js')
const {CONTACT,USER,BOOK,BOOK_UNDER_REVIEW,RESOLVED_CONTACT,TAG,AUTHOR,DELETED_BOOK,BOOK_CATEGORY,REVIEW,FAVBOOK,MESSAGE,ADMINUSER,APIUSER,BOOK_UPLOAD}=require('./models.js');
const drive = require('./gdrive_setup.js')

router.get('/admin-success',async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
                    
            if (isAdmin && isUnicode) {
                res.render("admin/admin_success", {  message: "Thanks " + req.user.name + " for your contribution !" })
            } else {
                res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
            }
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }


    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.get('/admin/upload-edit/:book_id',async (req, res) => {
    redis_setkey(req.ip+'-currloc','/admin/upload-edit/' + req.params.book_id)
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
            
            if (isAdmin && isUnicode) {
                isupt = req.query.isupt
                if(req.params.book_id=="newbook"){
                    res.render("admin/upload_edit", {  book: '', isupt: isupt })
                }else{
                    let book=await BOOK.findOne({ _id: req.params.book_id });
                    if (book) {
                        res.render("admin/upload_edit", {  book: book, isupt: isupt })
                    }else{
                        res.redirect("/error")
                    }
                }   
                
            } else {
                res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
            }
           
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }


    } catch (err) {
        res.redirect("/error")
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
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
            
            if (isAdmin && isUnicode) {
                if (req.query.book_id != null) {
                    let under_review_id=await BOOK_UNDER_REVIEW.find({ book_id: req.query.book_id });
                    if(under_review_id){
                        let book=await BOOK.find({_id:req.query.book_id});
                        if(book){
                            res.render('admin/under_review', { 'books': book, status: "none" })
                        }else{
                            res.redirect("/error")
                        }         
                    }
                } else {
                    let under_review_id=await BOOK_UNDER_REVIEW.find({});
                    if(under_review_id){
                        let under_review=[]
                        let books=await BOOK.find({});
                        if(books){
                            for(i in books){
                                for(j in under_review_id){
                                    if(books[i].id==under_review_id[j].book_id){
                                        under_review.push(books[i])
                                    }
                                }
                            }
                            res.render('admin/under_review', { 'books': under_review})
                        }
                    }
                }
            } else {
                res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
            }
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        res.redirect("/error")
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
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
            
            if (isAdmin && isUnicode) {
                let under_review_id=await BOOK_UNDER_REVIEW.find({})
                if(under_review_id){
                    res.send(under_review_id)
                }else{
                    res.sendStatus(404);
                }
            } else {
                res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
            }
          
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.get('/admin/add_to_review/:book_id',async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
            
            if (isAdmin && isUnicode) {
                const book = new BOOK_UNDER_REVIEW({
                    book_id: req.params.book_id,
                    user_id: req.user.id,
                    isUpdate: true
                })
                book.save();
                res.send("added")
            } else {
                res.sendStatus(401);
            }
            
        } else {
            res.sendStatus(401);
        }

    } catch (err) {
        res.redirect("/error")
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

        // target_folder_Id ="1KbAi3nOE-K1rgM9_ZVcR1Vu7L1bU8RWl"
        // source_folder_Id = ""

        const pdf_folder_Id = "1KbAi3nOE-K1rgM9_ZVcR1Vu7L1bU8RWl"
        const cover_folder_Id = "1qxPZjv0OEBWSWrOouc0LPHpmDGJkUHja"

        if (req.isAuthenticated()) {

            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
            
            if (isAdmin && isUnicode) {
                
                if (req.body.book_id != "newbook") {
                    
                    let book=await BOOK.findOne({ _id: req.body.book_id });
                        
                    if (book) {
                        book_cover_drive_link = book.book_cover_drive_link
                        book_cover_drive_id = book.book_cover_drive_id
                        book_cover_cloudinary_public_id = book.book_cover_cloudinary_public_id
                        book_cover_cloudinary_link = book.book_cover_cloudinary_link
                        pdf_file_link = book.book_file_link
                        pdf_file_drive_id = book.book_file_drive_id
                        pdf_file_download_link = book.book_file_download_link 
                    }else{
                        res.redirect("/error");return;
                    }
                }
                
                
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
                searchTag = req.body.book_name;
                let authors=[]
                let categories=[];
                let tags=[]

                if(req.body.authors!=''){
                    authorsArr=JSON.parse(req.body.authors)
                    authorsArr.forEach((author)=>{
                        searchTag+=("-"+author.name)
                        authors.push(author.name)
                    })
                }

                if(req.body.categories!=''){
                    categoriesArr=JSON.parse(req.body.categories)
                    categoriesArr.forEach((ctgry)=>{
                        searchTag+=("-"+ctgry.category+"-"+ctgry.subcategory)
                        categories.push(
                            new BOOK_CATEGORY({
                                book_category:ctgry.category,
                                book_subcategory:ctgry.subcategory
                            })
                        )
                    })
                }

                if(req.body.tags!=''){
                    tagsArr=JSON.parse(req.body.tags)
                    tagsArr.forEach((tag)=>{
                        if(tag.customTag!=""){
                        searchTag+=("-"+tag.tagType+"-"+tag.customTag)
    
                            tags.push(new TAG({
                                tagType:tag.tagType,
                                priority:tag.priority,
                                description:tag.tagDesc,
                                customTag:tag.customTag,
                            }))
                        }else{
    
                        searchTag+=("-"+tag.tagType)
    
                            tags.push(new TAG({
                                tagType:tag.tagType,
                                priority:tag.priority,
                                description:tag.tagDesc
                            }))
                        }
                       
                    })
                }
                
                searchTag = _.trim(_.toLower(searchTag)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '');
                if (req.body.book_id == "newbook") {
                    book = new BOOK({
                        uploader_name: req.user.name,
                        uploader_id: req.user.id,
                        book_name: req.body.book_name,
                        book_description: req.body.description,
                        author:authors,
                        book_cover_drive_link: book_cover_drive_link,
                        book_cover_drive_id: book_cover_drive_id,
                        book_cover_cloudinary_public_id: book_cover_cloudinary_public_id,
                        book_cover_cloudinary_link: book_cover_cloudinary_link,
                        book_file_link: pdf_file_link,
                        book_file_drive_id: pdf_file_drive_id,
                        book_file_download_link: pdf_file_download_link,
                        searchTag: searchTag,
                        category:categories,
                        book_tags:tags
                    })
                    book.save(function(err, saved_book) {
                        if(err){
                            log(err.stack, path.join(__dirname,'../error.log'))
                        }else{
                            under_review = new BOOK_UNDER_REVIEW({
                                book_id: saved_book.id,
                                isUpdate:false
                            })
                            under_review.save();
                            USER.findOneAndUpdate({ _id: req.user.id }, { $push:{ "account_record.booksUploaded": new BOOK_UPLOAD({bookId:saved_book.id}) } }, { new: true });

                        }
                    });
                } else {
                    // let book=await BOOK.findOne({ _id: req.body.book_id });
                        
                    // if(book){
                            // await drive.files.update({
                            //     fileId: book.book_file_drive_id,
                            //     supportsAllDrives: true,
                            //     driveID: '0AJ_wxWSWnk7tUk9PVA',
                            //     addParents: target_folder_Id,
                            //     removeParents: source_folder_Id,
                            // })
                        
                    // } else {
                    //     res.redirect("/error");return ;
                    // }

                   
                    BOOK.updateOne({ _id: req.body.book_id }, {
                        $set: {
                            uploader_name: req.user.name,
                            uploader_id: req.user.id,
                            book_name: req.body.book_name,
                            book_description: req.body.description,
                            author:authors,
                            book_cover_drive_link: book_cover_drive_link,
                            book_cover_drive_id: book_cover_drive_id,
                            book_cover_cloudinary_public_id: book_cover_cloudinary_public_id,
                            book_cover_cloudinary_link: book_cover_cloudinary_link,
                            book_file_link: pdf_file_link,
                            book_file_drive_id: pdf_file_drive_id,
                            book_file_download_link: pdf_file_download_link,
                            searchTag: searchTag,
                            category:categories,
                            book_tags:tags,
                            updatedAt: Date.now(),
                            updated_by_adminId: req.user.adminID,
                        }
                    }).then(() => {
                        
                        under_review = new BOOK_UNDER_REVIEW({
                            book_id: req.body.book_id,                
                            isUpdate: true
                        })
                        BOOK_UNDER_REVIEW.findOne({ book_id: req.body.book_id }, (err, isbook) => {
                            if (!isbook) {
                                under_review.save();
                            }
                        })
                        
                    })
                    
                }
                
                res.send("ok")
            } else {
                res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
            }
            
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        res.redirect("/error")
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
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            let admin_id;
            if (adminuser) {
                admin_id=adminuser.id;
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
            
            
                if (isAdmin && isUnicode) {
                    length = 0
                    await CONTACT.find({}, (err, msgs) => {
                        if (msgs) {
                            length = msgs.length
                        }
                    });
                    

                    CONTACT.findOne({ _id: req.body.client_mailId }, (err, contact) => {
                        if (contact) {
                            resolved_contact = new RESOLVED_CONTACT({
                                name: contact.name,
                                email: contact.email,
                                message: contact.message,
                                adminID:admin_id
                            })
                            resolved_contact.save();
                            contact.remove();
                            day = date();
                            const message = new MESSAGE({
                                msg: '(Reply from team) - ' + req.body.reply,
                            })
                            sendNotification("(Reply from team) ", req.body.reply, req.body.client_ID)
                            USER.findOne({ _id: req.body.client_ID }, (err, user) => {
                                if(user){
                                    user.notifications.push(message);
                                    user.save();
                                }
                            });
                            sendmail(req.body.client_mail, 'Reply from (mybooks)', '', reply_mail(req.body.reply))
                            res.send({ status: 'reply_sent', length: length })
                            USER.findOneAndUpdate({ username: req.user.username }, { $inc: { "account_record.q_resolved": 1 } }, { new: true });
                            USER.findOneAndUpdate({ username: req.user.username }, { $inc: { "account_record.credits": 1.5 } }, { new: true });
                        }
                    });


                } else {
                    res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
                }
            
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }


    } catch (err) {
        res.redirect("/error")
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
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
            if (isAdmin && isUnicode) {
                length = 0
                await CONTACT.find({}, (err, msgs) => {
                    if (msgs) {
                        length = msgs.length
                    }
                })
                CONTACT.findOne({ _id: req.params.msgID }, (err, contact) => {
                    if (contact) {
                        contact.remove();
                        res.send({ status: 'removed', length: length })
                    }
                })
                
            } else {
                res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
            }
            
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }


    } catch (err) {
        res.redirect("/error")
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
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
            if (isAdmin && isUnicode) {
                if (search_Tag == "All books") {
                    BOOK.find({}).limit(14).skip(skip).exec((err, books) => {
                        if(books){
                            res.send(books)
                        }
                    });
                } else {
                    BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).limit(14).skip(skip).exec((err, books) => {
                        if(books){
                            res.send(books)
                        }
                    });
                }
            } else {
                res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
            }
           
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        res.redirect("/error")
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
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
            if (isAdmin && isUnicode) {
                if (search_Tag == "All books") {
                    BOOK.find({}).limit(14).exec((err, books) => {
                        if(books){
                            res.render("admin/admin", { user_name: req.user.name, user_image: req.user.userimage, username: req.user.username, user_id: req.user.id,  searchtag: search_Tag, books: books })
                        }
                    });
                } else {
                    BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).limit(14).exec((err, books) => {
                        if(books){
                            res.render("admin/admin", { user_name: req.user.name, user_image: req.user.userimage, username: req.user.username, user_id: req.user.id,  searchtag: search_Tag, books: books })
                        }
                    });
                }
            } else {
                res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
            }
            
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        res.redirect("/error")
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
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
               
            if (isAdmin && isUnicode) {
                
                
                let user=await USER.findOne({ _id: req.params.id });
               
                if(user){
                    USER.updateOne({ _id: req.params.id }, { $set: { ismember: true, membershipType:"naive_user",searchtag: user.searchtag + "-member-naive_user" } }, (err) => {
                        if (!err) {
                            sendNotification("(Message from team) ", "Dear, your are now member of our platform. Your all activity on our platform will be recorded by us. Once you upload a book it will increment your credits, your referral link can also increment your credits if anybody signup with that link. Based on these credits you will be paid. Kindly acknowledge this mail for confirmation. Thanks for becoming our member !!.", req.params.id)
                            sendmail(user.username, 'Congrats for becoming our member', '', reply_mail("Dear, your are now member of our platform. Your all activity on our platform will be recorded by us. Once you upload a book it will increment your credits, your referral link can also increment your credits if anybody signup with that link. Based on these credits you will be paid. Kindly acknowledge this mail for confirmation. Thanks for becoming our member !!.")).catch((error) => log(error, path.join(__dirname,'../error.log')));
                            res.send("updated")
                        }
                    })
                }     
                
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
router.delete('/admin/removemember/:id',async (req, res) => {
    
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
               
            if (isAdmin && isUnicode) {
                searchtag = ""
                usermail = ""
                await USER.findOne({ _id: req.params.id }, (err, user) => {
                        
                    if(user){
                        searchtag +=  user.searchtag;
                        usermail = user.username;
                    }
                    
                })
            
                USER.updateOne({ _id: req.params.id }, { $set: { ismember: false, membershipType:"none",searchtag: searchtag.replace("-member-naive_user","") } }, (err) => {
                    if (!err) {
                        sendNotification("(Message from team) ", "Dear, your member access from our platform has been removed. If you have any pending payments kindly reply to our support team. Thank you for being our member !!.", req.params.id)
                        sendmail(usermail, 'Sorry you will no longer our member (myBooks)', '', reply_mail("Dear, your member access from our platform has been removed. If you have any pending payments kindly reply to our support team. Thank you for being our member !!.")).catch((error) => log(error, path.join(__dirname,'../error.log')));
                        res.send("updated")
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
router.delete('/admin/removeadmin/:id/:key',async (req, res) => {
   
    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
               
            if (isAdmin && isUnicode) {
                
                searchtag = ""
                usermail = ""
                await USER.findOne({ _id: req.params.id }, (err, user) => {
                       
                    if(user){
                        searchtag +=  user.searchtag;
                        usermail = user.username;
                        resolve(true)
                    }
                })
               
                USER.updateOne({ _id: req.params.id }, { $set: { membershipType:"naive_user", searchtag: searchtag.replace("-admin",""), unicode: null } }, (err) => {
                    if (!err) {
                        sendmail(usermail, 'Sorry you will no longer admin (myBooks)', '', reply_mail("Dear, your admin access from our platform has been removed. If you have any pending payments kindly reply to our support team. Thank you for being our member !! .")).catch((error) => log(error, path.join(__dirname,'../error.log')));
                        res.send("updated")
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
router.delete('/delete/:book_id',async (req, res) => {

    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
               
            if (isAdmin && isUnicode) {
                
                BOOK.findOne({ _id: req.params.book_id }, async(err, book) => {
                        if(book){
                            await drive.files.delete({
                                fileId: book.book_file_drive_id,
                                supportsAllDrives: true,
                                driveID: '0AJ_wxWSWnk7tUk9PVA',
                            });
                            deleted_book = new DELETED_BOOK({
                                uploader_id: book.uploader_id,
                                book_name: book.book_name,
                                publisher:book.publisher,
                                author:book.author,
                                book_description: book.book_description,
                                category:book.category,
                                book_cover_drive_link: book.book_cover_drive_link,
                                book_cover_drive_id: book.book_cover_drive_id,
                                book_cover_cloudinary_public_id: book.book_cover_cloudinary_public_id,
                                book_cover_cloudinary_link: book.book_cover_cloudinary_link,
                                book_file_link: book.book_file_link,
                                book_file_download_link: book.book_file_download_link,
                                book_file_drive_id: book.book_file_drive_id,
                                book_tags: book.book_tags,
                                searchTag: book.searchTag,
                                createdAt: book.createdAt,
                                deletedAt: Date.now(),
                                adminId: adminuser.id,
                                reviews: book.reviews
                            });
                            deleted_book.save();
                            BOOK_UNDER_REVIEW.findOne({ book_id: req.params.book_id }, (err, rwbook) => {
                                if (rwbook) {
                                    rwbook.remove();
                                }
                            })
                            
                            USER.findOne({ _id: book.uploader_id }, (err, user) => {
                                if(user){
                                    sendmail(user.username, 'Message from team', '', reply_mail("Dear " + book.uploader_name + ", The book you have uploaded named-" + book.book_name + " does not follow our guidelines so kindy re-upload it with correct details."))
                                    sendNotification("Message from team", "Dear " + book.uploader_name + ", The book you have uploaded named-" + book.book_name + " does not follow our guidelines so kindy re-upload it with correct details.", book.uploader_id)
                                    book.remove().then(()=>{
                                        res.send("deleted")
                                    });
                                }    
                            })
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
router.delete('/delete_under_review/:book_id',async (req, res) => {

    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
               
            if (isAdmin && isUnicode) {
                book=await BOOK.findOne({_id:req.params.book_id})
                BOOK_UNDER_REVIEW.findOne({ book_id: req.params.book_id }, (err, rbook) => {
                        if(rbook){
                            if (!rbook.isUpdate) {
                                findBookWithCategory=()=>{
                                    book.category.find(ctgry => {
                                        if(ctgry.book_category === "Nover or Fiction" || ctgry.book_category === "Others" ) {
                                          return true;
                                        }
                                    });
                                    return false;
                                }
                                if (findBookWithCategory()) {
                                    USER.findOneAndUpdate({ _id: book.user_id }, { $inc: { credits: 0.5 } }, { new: true })
                                } else {
                                    USER.findOneAndUpdate({ _id: book.user_id }, { $inc: { credits: 1 } }, { new: true })
                                }
                                sendNotification("Message from team", "Your book named '" + book.book_name + "' has been reviewed successfully and credits also got added to your account.", book.user_id)
                            }
                            book.remove();
                            indexUrl_overGoogle("https://mybooks-free.com/book/" + book.book_name)
                        }
                })
                BOOK_UNDER_REVIEW.find({}, (err, books) => {
                    if(books){               
                        res.send({ "length": books.length })
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

router.get('/admin/messages',async (req, res) => {

    try {
        redis_setkey(req.ip+'-currloc', '/admin/messages')

        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
               
            if (isAdmin && isUnicode) {
                
                CONTACT.find({}, (err, contacts) => {
                    if(contacts){
                        res.render('admin/admin_messages', {  contacts: contacts })
                    }
                })
            } else {
                res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
            }
            
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        res.redirect("/error")
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
                USER.findOneAndUpdate({ _id: req.params.id }, { $set: { "account_record.credits": req.body.credits } }, { new: true }, (err, user) => {
                    if (user) {
                        res.send(user)
                    } else {
                        res.send("unauthorized")
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
            const message = new MESSAGE({
                msg: req.body.message,
            })
            USER.findOne({ _id: req.params.id }, (err, user) => {
                if (user) {
                    user.notifications.push(message);
                    user.save();
                    sendNotification("Message from team", req.body.message, req.params.id)
                    sendmail(user.username, 'Message from team', '', reply_mail(req.body.message))
                    res.send("sent")
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


router.get('/admin/get_more_user',async (req, res) => {

    try {
        if (req.isAuthenticated()) {
            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
               
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
                            let usr_details=[]

                            memberPromise=new Promise((resolve,reject)=>{
                                if(members.length==0){
                                    resolve(true)
                                }else{
                                    members.forEach(async (member)=>{
                                        let userDetail=member
                                        let apiDetail=""
                                        let adminDetail=""
                                        await APIUSER.findOne({userId:member.id},(err,apiusr)=>{
                                            if(apiusr && !err){
                                                apiDetail=apiusr
                                            }else{
                                                apiDetail=""
                                            }
                                        })
                                        await ADMINUSER.findOne({userId:member.id},(err,adminusr)=>{
                                            if(adminusr && !err){
                                                adminDetail=adminusr
                                            }else{
                                                adminDetail=""
                                            }
                                        })
                                        usr_details.push({
                                            userDetail:userDetail,
                                            apiDetail:apiDetail,
                                            adminDetail:adminDetail
                                        })
                                        if(usr_details.length==members.length){
                                            resolve(true)
                                        }

                                    })
                                }
                            })
                            memberPromise.then(()=>{
                                res.send(usr_details)
                            })
                        }
                    })
                } else {
                    USER.find({ searchtag: { $regex: searchtag, $options: '$i' } }).limit(5).skip(skip).exec((err, members) => {
                        if(members){
                            let usr_details=[]
                            memberPromise=new Promise((resolve,reject)=>{
                                if(members.length==0){
                                    resolve(true)
                                }else{
                                    members.forEach(async (member)=>{
                                        let userDetail=member
                                        let apiDetail=""
                                        let adminDetail=""
                                        await APIUSER.findOne({userId:member.id},(err,apiusr)=>{
                                            if(apiusr && !err){
                                                apiDetail=apiusr
                                            }else{
                                                apiDetail=""
                                            }
                                        })
                                        await ADMINUSER.findOne({userId:member.id},(err,adminusr)=>{
                                            if(adminusr && !err){
                                                adminDetail=adminusr
                                            }else{
                                                adminDetail=""
                                            }
                                        })
                                        usr_details.push({
                                            userDetail:userDetail,
                                            apiDetail:apiDetail,
                                            adminDetail:adminDetail
                                        })
                                        if(usr_details.length==members.length){
                                            resolve(true)
                                        }
                                    })
                                }
                            })

                            memberPromise.then(()=>{
                                res.send(usr_details)
                            })
                        }
                    })
                }
            } else {
                res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
            }
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        res.redirect("/error")
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
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
               
            if (isAdmin && isUnicode) {
                let { searchtag } = req.query
                searchtag = _.trim(_.toLower(searchtag)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '')
                if (searchtag == "allusers" || searchtag == "") {
                        
                    USER.find({}).limit(5).exec((err, members) => {
                        if(members){
                            let usr_details=[]
                            
                            memberPromise=new Promise((resolve,reject)=>{
                                if(members.length==0){
                                    resolve(true)
                                }else{
                                    members.forEach(async (member)=>{
                                        
                                        let userDetail=member
                                        let apiDetail=""
                                        let adminDetail=""
                                        await APIUSER.findOne({userId:member.id},(err,apiusr)=>{
                                            if(apiusr && !err){
                                                apiDetail=apiusr
                                            }else{
                                                apiDetail=""
                                            }
                                        })
                                        await ADMINUSER.findOne({userId:member.id},(err,adminusr)=>{
                                            if(adminusr && !err){
                                                adminDetail=adminusr
                                            }else{
                                                adminDetail=""
                                            }
                                        })
                                        usr_details.push({
                                            userDetail:userDetail,
                                            apiDetail:apiDetail,
                                            adminDetail:adminDetail
                                        })
                                        if(usr_details.length==members.length){
                                            resolve(true)
                                        }
                                        
                                    })
                                }
                                
                            })
                            
                            memberPromise.then(()=>{
                                res.render('admin/members_detail', {  members: usr_details, currentAdmin: req.user.username, searchtag: "allusers" })
                            })
                            
                        }
                    })
                } else {
                    USER.find({ searchtag: { $regex: searchtag, $options: '$i' } }).limit(5).exec((err, members) => {
                        if(members){
                            let usr_details=[]
                            memberPromise=new Promise((resolve,reject)=>{
                                if(members.length==0){
                                    resolve(true)
                                }else{
                                    members.forEach(async (member)=>{
                                        let userDetail=member
                                        let apiDetail=""
                                        let adminDetail=""
                                        await APIUSER.findOne({userId:member.id},(err,apiusr)=>{
                                            if(apiusr && !err){
                                                apiDetail=apiusr
                                            }else{
                                                apiDetail=""
                                            }
                                        })
                                        await ADMINUSER.findOne({userId:member.id},(err,adminusr)=>{
                                            if(adminusr && !err){
                                                adminDetail=adminusr
                                            }else{
                                                adminDetail=""
                                            }
                                        })
                                        usr_details.push({
                                            userDetail:userDetail,
                                            apiDetail:apiDetail,
                                            adminDetail:adminDetail
                                        })
                                        if(usr_details.length==members.length){
                                            resolve(true)
                                        }
                                        
                                    })
                                }
                            })
                            memberPromise.then(()=>{
                                res.render('admin/members_detail', {  members: usr_details, currentAdmin: req.user.username, searchtag: searchtag })
                            })
                            
                        }
                    })
                }
            } else {
               res.render("admin/admin_login", { message: "Login before proceeding furthur ..", mail: req.user.username})
            }
            
        } else {
            res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
        }

    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})



router.get('/admin-login',async (req, res) => {
    if (req.isAuthenticated()) {
        unicode = req.cookies['mybooks_unicode']
        adminkey = req.cookies['mybooks_adminkey']
        errType=req.query.err;
        var isUnicode = false
        var isAdmin = false
        let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
        if (adminuser) {
            if (await bcrypt.compare(adminuser.unicode, unicode)) {
                isUnicode = true
            }
            if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                isAdmin = true
            }
        } 
           
        if (isAdmin && isUnicode) {
            res.redirect("/admin")
        } else {
            if(errType=="unauthorized"){
                res.render("admin/admin_login", { message: "Unauthorized access to the database !!", mail: req.user.username})
            }else if(errType=="wrong password"){
                res.render("admin/admin_login", { message: "Wrong password", mail: req.user.username})
            }else{
                res.render("admin/admin_login", { message: "", mail: req.user.username})
            }
        }
        
    } else {
        res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
    }

})


router.get('/admin-signup', (req, res) => {
    // redis_setkey(req.ip+'-currloc', '/admin-signup')
    // if (req.isAuthenticated()) {
    //     unicode = req.cookies['mybooks_unicode']
    //     adminkey = req.cookies['mybooks_adminkey']
    //     var isUnicode = false
    //     var isAdmin = false
    //     const admin_promise = new Promise((resolve, reject) => {
    //         ADMINUSER.findOne({ userId: req.user.id }, (err, user) => {
    //             if(err){
    //                 log(error, path.join(__dirname,'../error.log'))
    //                 res.redirect("/error")
    //             }else{
    //                 if (user) {
    //                     bcrypt.compare(user.unicode, unicode, (err, result) => {
    //                         if (result) {
    //                             isUnicode = true
    //                         }
    //                         bcrypt.compare(process.env.ADMIN_KEY, adminkey, (err, result) => {
                                
    //                             if (result) {
    //                                 isAdmin = true
    //                             }
    //                             resolve(true)
    //                         })
    //                     })
    //                 } 
    //             }
    //         })
    //     })
    //     admin_promise.then((result) => {
    //         // if (isAdmin && isUnicode) {
                res.render("admin/admin_signup", { message: "Register the user as admin", mail: "", unicode: "", key: "", otp: "", isvalid: "" })
            // }
    //     })
    // } else {
    //     res.render("client/login", { message: "You will need to authenticate before proceeding to admin's panel " })
    // }

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

router.post("/admin_register", async (req, res) => {
    if (req.isAuthenticated()) {
        otp.startOTPTimer(new Date().getTime());
        otp.setOTPDigits(4);
        await sendOTP("ankitkohli181@gmail.com", otp.generateOTP(req.params.email, 10), "OTP for registering new admin")
        res.send("sent")
    }    
})

router.post('/admin-signup',async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            var OTP = Number(req.body.otp)
            
            await ADMINUSER.findOne({ username: req.body.username }, (err, admin) => {
                if (admin) {
                    res.send({ message: "Error: This user is already being registered" });return;
                }
            })
            
            
            if (await validateOTP('ankitkohli181@gmail.com', req.body.otp) || otp.validateOTP('ankitkohli181@gmail.com', OTP)) {
                if (req.body.adminkey == process.env.ADMIN_KEY) {
                    USER.findOne({ username: req.body.username }, (err, user) => {
                        if (user) {
                            admin=new ADMINUSER({
                                username:req.body.username,
                                userId:user.id,
                                unicode:req.body.unicode,
                            })
                            user.ismember=true
                            user.membershipType="admin"
                            user.searchTag+="-member-admin"
                            admin.save();
                            res.send({ message: "Successfully registered the user as admin" })
                        }else {
                            res.send({ message: "USER NOT FOUND IN THE DATABASE", status: "401" })
                        }
                        
                    })
                        
                } else {
                    res.send({ message: "Unauthorized access !! enter correct key", status: "401" })
                }
            } else {
                res.send({ message: "Error !! please enter correct OTP", status: "401" })
            }
                
        }else{
            res.send({ message: "Error !! unauthorized access", status: "401" })
        }
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.post('/admin-login', async (req, res) => {
    try {
        if(req.isAuthenticated()){

            unicode = req.cookies['mybooks_unicode']
            adminkey = req.cookies['mybooks_adminkey']
            var isUnicode = false
            var isAdmin = false
            let adminuser=await ADMINUSER.findOne({ userId: req.user.id });  
            if (adminuser && unicode && adminkey) {
                if (await bcrypt.compare(adminuser.unicode, unicode)) {
                    isUnicode = true
                }
                if (await bcrypt.compare(process.env.ADMIN_KEY, adminkey)) {
                    isAdmin = true
                }
            } 
               
            if (isAdmin && isUnicode) {
                    res.redirect("/home")
            }else{
                
                var OTP = Number(req.body.otp)
                if (req.body.adminkey == process.env.ADMIN_KEY) {
                    if (await validateOTP(req.body.username, req.body.otp) || otp.validateOTP(req.body.username, OTP)) {
                            
                        if (adminuser && req.body.username==req.user.username) {
                            if (adminuser.unicode == req.body.unicode) {
                                sendmail('ankitkohli181@gmail.com', 'admin logged in (mybooks)', 'admin-name -' + req.user.name + ' , ' + 'admin-email -' + req.body.username, "")
    
                                bcrypt.hash(req.body.unicode, 5, (err, Unicode) => {
                                    bcrypt.hash(req.body.adminkey, 5, (err, adminKey) => {
                                        if (!err) {
                                            res.cookie('mybooks_unicode', Unicode, { maxAge: 1.2960E+9 })
                                            res.cookie('mybooks_adminkey', adminKey, { maxAge: 1.2960E+9 })
                                    
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
                            
            
                    } else {
                        res.send({ message: "Error !! please enter correct OTP", status: "401" })
                    }
                
                } else {
                    res.send({ message: "Unauthorized access !! enter correct key", status: "401" })
                }
            }
            
        }else {
            res.send({ message: "Unauthorized access", status: "401" })
        }
        

    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.get('/request_access', (req, res) => {
    sendmail('ankitkohli181@gmail.com', 'Requesting admin access', 'username -' + req.user.username, "")
    res.send("Email sent")
})


module.exports=router


