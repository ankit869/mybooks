// Client- panel 
const otp = require('in-memory-otp');
const express = require('express');
const { google } = require("googleapis")
const router = express.Router();
const passport = require('./passport.js')
const sendmail = require('./mail.js')
const path = require("path")
var gbooks = require('google-books-search');
const fs = require('fs');
const log = require('log-to-file');
const bodyParser = require("body-parser");
const multer = require("multer");
const date = require("../date.js");
const contact_mail = require("../../mail_templates/contact_template.js");
const reply_mail = require("../../mail_templates/reply_template.js");
var rand = require("random-key");
var cloudinary = require('cloudinary');
const cookieParser = require('cookie-parser')
const _ = require("lodash");
let day = date();
const { resolve } = require('path');
const { exit } = require('process');
const sharp = require('sharp');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})
const {sendOTP,validateOTP}=require('./otp.js')
const {client,redis_setkey,redis_setotp}=require('./redis_conf.js')
const sendNotification=require('./notification.js')
const drive = require('./gdrive_setup.js')
const {CONTACT,TOKEN,FEED,USER,BOOK,BOOK_UNDER_REVIEW,REVIEW,TAG,BOOK_CATEGORY,FAVBOOK,MESSAGE,APIUSER,BOOK_UPLOAD}=require('./models.js');

// Subscribe Route
router.get("/subscribe", (req, res) => {
    // Get pushSubscription object
    if (req.isAuthenticated()) {
        USER.updateOne({ _id: req.user.id }, { $set: { SW_subscription: JSON.parse(req.query.subscription) } }).then(() => {
            res.status(201).json({});
        })
    } else {
        res.status(401).json({})
    }
});

router.get("/null", (req, res) => {
    res.redirect("/home")
});

router.get("/update_token",async (req, res) => {
    try {
        if (req.query.password == process.env.PASSWORD && req.query.key == process.env.ADMIN_KEY) {
            let token=await TOKEN.updateOne({ type: "email-auth-token" }, { $set: { refreshToken: req.query.refreshToken } });
            if(token){
                res.send("updated");
            }
        } else {
            res.send("unauthorized")
        }
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
)

router.get("/auth/google/mybooks",passport.authenticate("google", { failureRedirect: "/login" }),async (req, res) => {
    try {
        var NewUser = false;
        
        let user=await USER.findOne({ _id: req.user.id });   
        if (!user.searchtag) {
            NewUser = true;
        }
       
        if (NewUser) {
            USER.findOneAndUpdate({ username: req.user.username }, { $set: { searchtag: _.trim(_.toLower(req.user.name)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '') + "-" + req.user.email } }, { new: true });
            sendmail('ankitkohli181@gmail.com', 'New User logged in (google-mybooks)', 'name -' + req.user.name + ' , ' + 'email -' + req.user.username , "")
        }
        
        client.get(req.ip+'-currloc', function(err, response) {
            if(err){ 
                res.redirect('/home') 
            }else{
                res.redirect(response) 
            }
        });
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
    
});

router.get('/', async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', '/home')
        let books=await BOOK.find({});
        if(books){
            res.render("client/index", {  books: books })
        }else{
            res.redirect("/error")
        }
        
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/privacy',async (req, res) => {
    res.render("policies/privacy");
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

router.get('/t&c',async (req, res) => {
    res.render("policies/t&c");
})

router.get('/dmca', (req, res) => {
    res.render("policies/dmca");
})

router.get('/home',async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', '/home')
        let books=await BOOK.find({});
        if (books) {
            
            res.render("client/index", {  books: books })
            
        }else{
            res.redirect("/error")
        }
         
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/user/:userid',async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', "/user/" + req.params.userid)
        if (req.isAuthenticated()) {

            let user=await USER.findOne({ _id: req.params.userid });;
            if (user) {
                let apiuser=await APIUSER.findOne({userId:req.user.id});;
                if(apiuser){
                    res.render("client/user_details", { user: user, current_userid: req.user.id ,apiData:apiuser})
                }else{
                    res.render("client/user_details", { user: user, current_userid: req.user.id ,apiData:""})
                }
            } else {
                res.send("user not found !!");
            }
        } else {
            res.redirect("/login");
        }

    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.post('/request_withdraw',async (req, res) => {
    try {
        if (Number(req.user.account_record.credits) >= 100) {
            sendmail('ankitkohli181@gmail.com', 'Request for withdraw credits in mybooks', 'name -' + req.user.name + ' , ' + 'id -' + req.user.id + ' , ' + 'email -' + req.user.username + ' , ' + 'payment_number -' + req.body.number + ' , ' + 'payment_type -' + req.body.payment_type)

            sendmail(req.body.username, 'Request pending for withdraw credits in mybooks', '', reply_mail("Your request for withdraw is sent to our team for processing. You will recieve your payment with in  2 to 3 days. To avoid any delays make sure your paytm or google pay number is working properly. "))

            res.send("sent")

            sendNotification("Message from team", "Your request for withdraw is sent to our team for processing. You will recieve your payment with in  2 to 3 days. To avoid any delays make sure your paytm or google pay number is working properly.", req.user.id)

            day = date();
            const message = new MESSAGE({
                msg: "Your request for withdraw is sent to our team for processing. You will recieve your payment with in  2 to 3 days. To avoid any delays make sure your paytm or google pay number is working properly.",
                type: 'payment'
            })
            let user=await USER.findOne({ _id: req.user.id });
            if(user){
                user.notifications.push(message);
                user.save();
            }   
            
        } else {
            res.send("low_credits")
        }

    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/sitemap.xml',async (req, res) => {
    // this is the source of the URLs on your site, in this case we use a simple array, actually it could come from the database
    try {
        let books=await BOOK.find({});
        if (books) {
            index_urls = ""
            urls = [
                "home", "about", "upload", "contact", "privacy", "dmca", "books",
                "admin",
                "admin/messages",
                "admin/under-review",
                "admin/members",
                "/webapps//doc-scanner",
                "/webapps//api",
                "books/Bachelor of Science (B.Sc)",
                "books/Bachelor of Commerce (B.Com)",
                "books/Bachelors of Business Administration (BBA)",
                "books/Bachelors of Computer Application (BCA)",
                "books/Bachelor of Education (B.Ed)",
                "books/Bachelor of Technology (B.Tech)",
                "books/Post Graduation or Master Degree",
                "books/Competetive Exams",
                "books/Diploma Courses",
                "books/Novel or Fiction",
                "books/Secondary Education Class 6th-12th",
                "books/Primary Education Class 1st-5th",
                "books/Pre Primary Education"
            ];
            books.forEach((book) => {
                urls.push("book/" + book.book_name)
            })
            urls.forEach((url) => {
                index_urls += "https://mybooks-free.com/" +url+ "\n"
            })
            fs.writeFile(path.join(__dirname,'../../readme/urls.txt'), index_urls, (err) => {
                // throws an error, you could also catch it here
                if (err) log(err.stack, path.join(__dirname,'../error.log'));
            });
            // the root of your website - the protocol and the domain name with a trailing slash
            var root_path = 'https://mybooks-free.com/';
            // XML sitemap generation starts here
            var priority = 0.5;
            var freq = 'daily';
            var xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
            for (var i in urls) {
                xml += '<url>';
                xml += '<loc>' + root_path + urls[i] + '</loc>';
                xml += '<changefreq>' + freq + '</changefreq>';
                xml += '<priority>' + priority + '</priority>';
                xml += '</url>';
                i++;
            }
            xml += '</urlset>';
            res.header('Content-Type', 'text/xml');
            res.send(xml);
        }else{
            res.redirect("/error")
        }
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }


})

router.get('/contact',async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', '/contact')
        if (req.isAuthenticated()) {
            res.render("client/contact", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username})
        } else {
            res.render("client/contact", { user_name: "", user_image: "", user_email: ""})
        }

    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.get('/about',async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', '/about')
        
        res.render("client/about")
        

    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})


router.get('/login',async (req, res) => {
    if (req.isAuthenticated()) {
        client.get(req.ip+'-currloc', function(err, response) {
            if(err){ 
                log(err.stack, path.join(__dirname,'../error.log'))
                res.redirect('/home') 
            }else{
                res.redirect(response) 
            }
        });
    } else {
        res.render("client/login", { message: "" })
    }
})

router.get('/login-error',async (req, res) => {

    if (req.isAuthenticated()) {
        client.get(req.ip+'-currloc', function(err, response) {
            if(err){ 
                log(err.stack, path.join(__dirname,'../error.log'))
                res.redirect('/home') 
            }else{
                res.redirect(response) 
            }
        });
    } else {
        res.render("client/login", { message: "Please login before proceeding..." })
    }

})



router.get("/logout",async (req, res) => {
    req.logOut();
    res.redirect('back')
});

router.get('/signup',async (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/home")
    } else {
        res.render("client/signup", { message: "", referral: req.query.referral })
    }
})

router.get('/reset', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("client/reset", { message: "Enter the email and OTP to reset your password",username:req.user.username })
    } else {
        res.render("client/reset", { message: "Enter the email and OTP to reset your password",username:"" })
    }
})

router.get('/upload', (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', '/upload')
        
        res.render("client/upload") 

    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.get('/success', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("client/success", {  message: "Thanks " + req.user.name + " for your contribution !" })
    } else {
        res.redirect("/home")
    }
})

router.get('/error', (req, res) => {
    res.render("partials/error", { message: "" })
})

router.get('/reviews/:book_id',async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', "/reviews/" + req.params.book_id)
        let book=await BOOK.findOne({ _id: req.params.book_id });
        if(book){    
            res.render("client/reviews", {  book: book })
            
        }else{
           res.redirect("/error")
        }           
            
        
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/mybooks', async(req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', "/mybooks")
        if (req.isAuthenticated()) {
            let books=await BOOK.find({});
            if(books){
                fav_books=[]
                for(i in books){
                    for(j in req.user.fav_books){
                        if(books[i].id==req.user.fav_books[j].book_id){
                            fav_books.push(books[i])
                        }
                    }
                }
                res.render("client/mybooks", {  books: fav_books})
            }else{
                res.redirect("/error")
            }
        } else {
            res.redirect("/login-error")
        }
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/book/:book', async(req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', "/book/" + req.params.book)
        var isBook = false;
        let book=await BOOK.findOne({ _id: req.params.book });;
        if(book){
            res.render("client/book_detail", {  book: book })
            isBook = true;
        }else{
            book=await BOOK.findOne({ book_name: req.params.book });
            if(book){ 
                res.render("client/book_detail", {  book: book })  
            }else{
                res.redirect("/error")
            }
        }
        
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/books/:course', async(req, res) => {
    res.redirect('/books?searchtag=' + req.params.course);
})

router.get('/get_more_books', async(req, res) => {
    try {
        let { page } = req.query;

        search_item = req.query.searchtag
        search_Tag = req.query.searchtag
        gskip = req.query.gskip
        get_gbooks = gskip;
        search_item = _.trim(_.toLower(search_item)).replace(/[&\/\\#,+()$~%.`'":*?<>{} ]/g, '');
        page = parseInt(page)
        const skip = (page - 1) * 14;
        var options = {
            key: "AIzaSyAVDXADPF7g8hXn7TJp8dEsuz8JKwktgcU",
            // field: 'title',
            offset: 0,
            limit: 40,
            type: 'books',
            order: 'relevance',
            lang: 'en'
        };
        if (search_Tag == "All books") {
            let books=await BOOK.find({}).limit(14).skip(skip);
            if(books){
                const bk_length = books.length;
                gbooks.search(search_Tag, options, function(error, results, apiResponse) {
                    if (!error) {
                        for (i = gskip, j = 0;
                            (i < results.length && j < 14 - bk_length); j++, i++) {
                            books.push(results[i])
                            get_gbooks++;
                        }
                    }else{
                        log(error, path.join(__dirname,'../error.log'))
                    }
                    res.send({ 'books': books, 'gskip': get_gbooks })
                });
            }else{
                res.redirect("/error")
            }
            
            
        } else {
            let books=await BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).limit(14).skip(skip); 
            if(books){
                const bk_length = books.length;
                gbooks.search(search_Tag, options, function(error, results, apiResponse) {
                    if (!error) {
                        for (i = gskip, j = 0;
                            (i < results.length && j < 14 - bk_length); j++, i++) {
                            books.push(results[i])
                            get_gbooks++;
                        }
                    }else{
                        log(error, path.join(__dirname,'../error.log'))
                    }
                    res.send({ 'books': books, 'gskip': get_gbooks })
                });
            }else{
                res.redirect("/error")
            }
        }

    }catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.get('/books', async(req, res) => {
    try {
        get_gbooks = 0;
        search_item = req.query.searchtag
        search_Tag = req.query.searchtag
        
        redis_setkey(req.ip+'-currloc', "/books?searchtag=" + search_Tag)

        search_item = _.trim(_.toLower(search_item)).replace(/[&\/\\#,+()$~%.`'":*?<>{} ]/g, '');
        if (search_Tag == null) {
            res.redirect("/books?searchtag=All books")
        } else {

            var options = {
                key: "AIzaSyAVDXADPF7g8hXn7TJp8dEsuz8JKwktgcU",
                // field: 'title',
                offset: 0,
                limit: 14,
                type: 'books',
                order: 'relevance',
                lang: 'en'
            };

            

            if (search_Tag == "All books") {
                let books=await BOOK.find({}).limit(14);
                if(books){
                    bk_length = books.length;
                    gbooks.search(search_Tag, options, function(error, results, apiResponse) {
                        if (!error) {
                            for (i = 0; i < 14 - bk_length; i++) {
                                books.push(results[i])
                                get_gbooks++;
                            }
                        } else {
                            log(error, path.join(__dirname,'../error.log'))
                        }
                        res.render("client/books", {  category: search_Tag, books: books, gskip: get_gbooks })
                    });
                }else{
                    res.redirect("/error")
                } 
                
            } else {
                let books=await BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).limit(14)
                if(books){    
                    bk_length = books.length;
                    gbooks.search(search_Tag, options, function(error, results, apiResponse) {
                        if (!error) {
                            for (i = 0; i < 14 - bk_length; i++) {
                                books.push(results[i])
                                get_gbooks++;
                            }
                        } else {
                            log(error, path.join(__dirname,'../error.log'))
                        }
                        res.render("client/books", {  category: search_Tag, books: books, gskip: get_gbooks })
                    });
                }else{
                    res.redirect("/error")
                }
                    
            }
            
        }

    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/search', async(req, res) => {

    try {

        search_item = req.query.search_item
        search_Tag = req.query.search_item
        search_item = _.trim(_.toLower(search_item)).replace(/[&\/\\#,+()$~%.`'":*?<>{} ]/g, '');
        console.log(search_item)
        let { page, size } = req.query;
        page = parseInt(page)
        size = parseInt(size)
        if (!page) {
            page = 1;
        }
        if (!size) {
            size = 14;
        }
        const limit = size;
        const skip = (page - 1) * size;

        redis_setkey(req.ip+'-currloc', "/search?search_item=" + search_Tag + "&page="+page)

        let books=await BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).limit(limit).skip(skip);
        if(books){
            const bk_length = books.length;
            if (skip == 0) {
                gskip = 0;
            } else {
                gskip = skip - books.length;
            }
            const gbooks_promise = new Promise((resolve, reject) => {
                var options = {
                    key: "AIzaSyAVDXADPF7g8hXn7TJp8dEsuz8JKwktgcU",
                    // field: 'title',
                    offset: 0,
                    limit: 40,
                    type: 'books',
                    order: 'relevance',
                    lang: 'en'
                };

                gbooks.search(search_Tag, options, function(error, results, apiResponse) {
                    if (!error) {
                        for (i = gskip, j = 0;
                            (i < results.length && j < limit - bk_length); j++, i++) {
                            books.push(results[i])
                        }
                        
                    } else {
                        log(error, path.join(__dirname,'../error.log')) 
                    }
                    resolve(true)
                });
            });
            gbooks_promise.then((result) => {
                
                if (books.length == 0 && page == 1) {
                    res.render("client/search", {  search_item: search_Tag, books: "empty", page: "only_this_page" })
                } else if (books.length < 14 && page == 1) {
                    res.render("client/search", {  search_item: search_Tag, books: books, page: "only_this_page" })
                } else if (books.length == 0) {
                    res.redirect("/search?search_item=" + search_Tag + "&page=1")
                } else {
                    res.render("client/search", {  search_item: search_Tag, books: books, page: page })
                }
            
            })
        }else{
            res.redirect("/error")
        }
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/advanced_search',async (req, res) => {
    searchTag = req.query.sub_category
    res.redirect("/books?searchtag=" + searchTag)
})


router.get('/private/user_detail',async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            let user=await USER.findOne({ _id: req.user.id });
            if(user){ res.send(user) }
            else{ res.send("user not found")}

        } else {
            res.send("unauthorized")
        }
    } catch (err) {
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


const storage = multer.diskStorage({
    filename: (req, files, cb) => {
        file_name = files.originalname;
        cb(null, file_name)
    }
})

const upload = multer({
    storage: storage,
}).fields([{ name: 'image_file', maxCount: 1 }, { name: 'pdf_file', maxCount: 1 }]);

router.post("/upload", upload, async(req, res) => { 
    try {
        book_cover_drive_link = ""
        book_cover_cloudinary_link = ""
        book_cover_cloudinary_public_id = ""
        book_cover_link = ""
        book_cover_drive_id = ""
        pdf_file_link = ""
        pdf_file_drive_id = ""
        pdf_file_download_link = ""
        fileId = ""
        const pdf_folder_Id = "1KbAi3nOE-K1rgM9_ZVcR1Vu7L1bU8RWl"
        const cover_folder_Id = "1qxPZjv0OEBWSWrOouc0LPHpmDGJkUHja"

        if (req.isAuthenticated()) {

            if (req.files.image_file == null) {
                book_cover_drive_link = "https://drive.google.com/file/d/1X36RwEmMjtRk55-Uayp5Whw-xM5fRJ88/view?usp=sharing";
                book_cover_drive_id = "1X36RwEmMjtRk55-Uayp5Whw-xM5fRJ88"
                book_cover_cloudinary_link = "https://res.cloudinary.com/mybooks-webmaster/image/upload/v1631263017/books-cover/book_qlovyv.jpg"
                book_cover_cloudinary_public_id = "book_qlovyv";
            } else {

                //  await sharp(req.files.image_file[0].path).toFile(__dirname+'/public/images/tempfile.webp')
                await sharp(req.files.image_file[0].path).toFile(path.join(__dirname,'../tmp/tempfile.webp'))
                const cloud_response = await cloudinary.v2.uploader.upload(path.join(__dirname,'../tmp/tempfile.webp'), { folder: "books_cover" })
                    //  const cloud_response=await cloudinary.v2.uploader.upload(req.files.image_file[0].path,{ folder: "mybook_covers"})
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
                        // body: fs.createReadStream(req.files.image_file[0].path)
                };

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

            searchTag = req.body.book_name

            let authors=[]
            authorsArr=JSON.parse(req.body.authors)
            authorsArr.forEach((author)=>{
                searchTag+=("-"+author.name)
                authors.push(author.name)
            })

            let categories=[];
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
            // authors=JSON.stringify
            searchTag = _.trim(_.toLower(searchTag)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '');
            book = new BOOK({
                uploader_name: req.user.name,
                uploader_id: req.user.id,
                book_name: req.body.book_name,
                author:authors,
                book_cover_drive_link: book_cover_drive_link,
                book_cover_drive_id: book_cover_drive_id,
                book_cover_cloudinary_public_id: book_cover_cloudinary_public_id,
                book_cover_cloudinary_link: book_cover_cloudinary_link,
                book_file_link: pdf_file_link,
                book_file_drive_id: pdf_file_drive_id,
                book_file_download_link: pdf_file_download_link,
                searchTag: searchTag,
                category:categories
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
                    USER.findOneAndUpdate({ _id: req.user.id }, { $push:{ "account_record.booksUploaded": new BOOK_UPLOAD({bookId:saved_book.id}) } }, { new: true })
                    res.redirect("/success")
                }
            });

            sendNotification("Book uploaded successfully", "Your book has been added to our review section once its approved you will get the credits", req.user.id)

        } else {
            res.redirect("/login-error")
        }
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.post('/addTofav/:book_id',async (req, res) => {
    try {

        if (req.isAuthenticated()) {
            var isFav = false
            const favbook = new FAVBOOK({
                book_id: req.params.book_id
            })
            
            let user=await USER.findOne({ _id: req.user.id });
            if(user){
                user.fav_books.forEach(function(fav_bookid) {
                    if (fav_bookid.book_id == req.params.book_id) {
                        isFav = true;
                    }
                })
            }else{
                res.sendStatus(404);return;
            }
            if (isFav) {
                user=await USER.findOneAndUpdate({ _id: req.user.id }, { $pull: { fav_books: { book_id: req.params.book_id } } }, { new: true });  
                if (user.fav_books.length == 0) {
                    res.send("deleted_empty")
                } else {
                    res.send("deleted")
                }
                        
            } else {        
                user.fav_books.push(favbook);
                user.save();
                res.send("added")    
            }

        } else {
            res.send("unauthorized")
        }
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.post('/review/:book_id/:message',async (req, res) => {
    try {

        day = date();
        if (req.isAuthenticated()) {
            const review = new REVIEW({
                user_commented: req.user.name,
                message: req.params.message,
            })
            let book=await BOOK.findOne({ _id: req.params.book_id });
                
            if(book){
                book.reviews.push(review)
                book.save();
                res.send(book)
            }else{
                res.sendStatus(404);
            }  
                
        } else {
            res.send("unauthorized")
        }

    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.delete('/user/remove_msg/:msgID',async (req, res) => {

    try {
        if (req.isAuthenticated()) {

            let user=await USER.findOneAndUpdate({ _id: req.user.id }, { $pull: { notifications: { _id: req.params.msgID } } }, { new: true });
                
            if (user) {
                if (user.notifications.length == 0) {
                    res.send("deleted_empty")
                } else {
                    res.send("deleted")
                }
            } else {
                res.send("unauthorized")
            }
                

        } else {
            res.send("unauthorized")
        }

    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.post('/feedback/:message',async (req, res) => {
    const feed = new FEED({
        message: req.params.message
    })
    feed.save();
    res.send('ok');
})

router.post('/contact',async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            var contact = new CONTACT({
                name: req.body.name,
                email: req.body.email,
                message: req.body.message,
                date: day,
                userID: req.user.id
            })
            contact.save();

            const message = new MESSAGE({
                msg: "Thanks for contacting, us we will review and reply your message as soon as possible."
            })
            let user=await USER.findOne({ _id: req.user.id });
                
            if(user){
                user.notifications.push(message);
                user.save();
            }
                
            sendNotification(": Thanks for contacting us.", "We will review and reply to your message as soon as possible", req.user.id)

            sendmail(req.body.email, ': Thanks for contacting us (myBooks)', '', contact_mail())

            sendmail("mybooks.webmaster@gmail.com", 'New message from ' + req.body.email, '', reply_mail(req.body.message))

            res.render("client/success", { user_name: req.user.name, user_image: req.user.userimage,  message: "Thanks " + req.body.name + " for your response we will contact you as soon as possible !" })

        } else {
            var contact = new CONTACT({
                name: req.body.name,
                email: req.body.email,
                message: req.body.message,
            })
            contact.save();

            sendmail(req.body.email, ': Thanks for contacting us (myBooks)', '', contact_mail())

            sendmail("mybooks.webmaster@gmail.com", 'New message from ' + req.body.email, '', reply_mail(req.body.message))

            res.render("client/success", { user_name: "", user_image: "",  message: "Thanks " + req.body.name + " for your response we will contact you as soon as possible !" })

        }


    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.post('/signup', (req, res) => {
    try {
        if (req.body.referral != "") {
            USER.findOneAndUpdate({ _id: req.body.referral }, { $inc: { "account_record.credits": 1 } }, { new: true }, (err, user) => { if (err) {  } });
            USER.findOneAndUpdate({ _id: req.body.referral }, { $inc: { "account_record.refferals": 1 } }, { new: true }, (err, user) => { if (err) {  } });
        }

        USER.register({ username: req.body.username, name: req.body.name, userimage: "/images/user-icon.png", searchtag: _.trim(_.toLower(req.body.name)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '') + "-" + req.body.username }, req.body.password, (err) => {
            if (err) {
                log(err.stack, path.join(__dirname,'../error.log'))
                res.render("client/login", { message: "Already a member try to Login or SignIn with google" })
            } else {
                passport.authenticate("local")(req, res, () => {
                    sendmail('ankitkohli181@gmail.com', 'User logged in (local-mybooks)', 'name -' + req.body.name + ' , ' + 'email -' + req.body.username, "")
                    client.get(req.ip+'-currloc', function(err, response) {
                        if(err){ 
                            log(err.stack, path.join(__dirname,'../error.log'))
                            res.redirect('/home') 
                        }else{
                            res.redirect(response) 
                        }
                    });
                })
            }

        })
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.post('/login',async (req, res) => {
    try {
        const old_user = new USER({
            username: req.body.username,
            password: req.body.password
        })
        let user=await USER.findOne({ username: req.body.username });   
        if (user) {
            if (user.isGoogleUser) {
                res.send({ message: "You are already registered try to sign in with google", status: "401" })
            } else {
                req.login(old_user, (err) => {
                    if (!err) {
                        passport.authenticate("local")(req, res, () => {
                            client.get(req.ip+'-currloc', function(err, response) {
                                if(err){ 
                                    res.send({ message: "Login successful, redirecting...", status: "200", authUrl: '/home' })
                                }else{
                                    res.send({ message: "Login successful, redirecting...", status: "200", authUrl: response })
                                }
                            });
                        })
                    }else{
                        log(err, path.join(__dirname,'../error.log'))
                        res.send({ message: "An Error Occured please try again or report us this issue !!", status: "401" })
                    }
                })
            }
        } else {
            res.send({ message: "Wrong credentials try to enter correct email and password", status: "401" })
        }
            
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.post("/reset/:email", async(req, res) => {
    try {
        let user=await USER.findOne({ username: req.params.email });
            
        if (user) {
            if (user.isGoogleUser) {
                res.send("already_g")
            } else {
                otp.startOTPTimer(new Date().getTime());
                otp.setOTPDigits(4)
                await sendOTP(req.params.email, otp.generateOTP(req.params.email, 10), "OTP for reset of your account");
                res.send("ok")
            }
        } else {
            res.send("notfound")
        }
            
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.post("/reset", async(req, res) => {
    try {
        var OTP = Number(req.body.otp)

        if (await validateOTP(req.body.username, req.body.otp) || otp.validateOTP(req.body.username, OTP)) {
            USER.findOne({ username: req.body.username }, (err, sanitizedUser) => {
                if (sanitizedUser) {
                    sanitizedUser.setPassword(req.body.newpassword, function() {
                        sanitizedUser.save();
                        res.send({ message: "Password updated successfully !! Redirecting to Login's panel...", status: "200" })

                    });
                } else {
                    res.send({ message: "Not a member try to signUp", status: "401" })
                }
            })
        } else {
            res.send({ message: "OTP is invalid please enter again !!", status: "401" })
        }
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

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
                USER.updateOne({_id:req.user.id},{ $set: { searchtag: req.user.searchtag.replace('-apiuser-apienabled-apiclient', '-apiuser-apidisabled-apiclient')}}).then(()=>{
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

router.get("/error.log",(req, res)=>{
    res.sendFile(path.join(__dirname,"../error.log"))
})

// router.get("/update",(req,res)=>{
   
//         BOOK.find({},(err, books)=>{
//             books.forEach((book)=>{
//                 obj=new BOOK_UPLOAD({
//                     bookId:book.id
//                 })
//                 USER.updateOne({_id:"61a4e65fe965ec63c43a6eae"},{$push:{"account_record.booksUploaded":obj}},(err)=>{
//                     console.log(err)
//                 })
//             })
//         })
    
// })
module.exports=router
