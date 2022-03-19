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
const drive = require('./gdrive_setup.js')
const {CONTACT,TOKEN,FEED,USER,BOOK,BOOK_UNDER_REVIEW,REVIEW,BOOK_CATEGORY,FAVBOOK,MESSAGE}=require('./models.js');

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
            TOKEN.updateOne({ type: "email-auth-token" }, { $set: { refreshToken: req.query.refreshToken } }, (err) => {
                if (err) { log(err.stack, path.join(__dirname,'../error.log')) } else {
                    res.send("updated")
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

router.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
)

router.get("/auth/google/mybooks",passport.authenticate("google", { failureRedirect: "/login" }),async (req, res) => {
    try {
        var NewUser = false;
        const googlePromise = new Promise((resolve, reject) => {
            USER.findOne({ username: req.user.username }, (err, user) => {
                if(err){
                    log(err.stack, path.join(__dirname,'../error.log'))
                }
                if (!user.searchtag) {
                    NewUser = true;
                }
                resolve(true)
            })
        })
        // console.log("NewUser? " + NewUser)
        googlePromise.then((result) => {
            if (NewUser) {
                USER.findOneAndUpdate({ username: req.user.username }, { $set: { searchtag: _.trim(_.toLower(req.user.name)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '') + "-" + req.user.email } }, { new: true }, (err, user) => { if (err) {  } })
            }
        })

        client.get(req.ip+'-currloc', function(err, response) {
            if(err){ 
                res.redirect('/home') 
            }else{
                res.redirect(response) 
            }
        });
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
    
});

router.get('/', async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', '/home')
        BOOK.find({}, (err, books) => {
            if (!err) {
                if (req.isAuthenticated()) {
                    res.render("client/index", { user_name: req.user.name, user_image: req.user.userimage, status: "none", books: books })
                } else {
                    res.render("client/index", { user_name: "", user_image: "", status: "block", books: books })
                }
            }else{
                log(err.stack, path.join(__dirname,'../error.log'))
            }
        })
    } catch (err) {
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
            if (req.user.api_status) {
                res.render("webapps/api", { user: req.user, status: req.user.api_key })
            } else {
                res.render("webapps/api", { user: req.user, status: "enable the api to get its access" })
            }
        } else {
            res.render("webapps/api", { user: "", status: "please login to our site to get your api key" });
        }
    } catch (err) {
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
        BOOK.find({}, (err, books) => {
            if (!err) {
                if (req.isAuthenticated()) {
                    res.render("client/index", { user_name: req.user.name, user_image: req.user.userimage, status: "none", books: books })
                } else {
                    res.render("client/index", { user_name: "", user_image: "", status: "block", books: books })
                }
            }else{
                log(err.stack, path.join(__dirname,'../error.log'))
            }
        })
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/user/:userid',async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', "/user/" + req.params.userid)
        if (req.isAuthenticated()) {
            USER.findOne({ _id: req.params.userid }, (err, user) => {
                if(err){
                    log(err.stack, path.join(__dirname,'../error.log'))
                }else{
                    if (user) {
                        res.render("client/user_details", { user: user, current_userid: req.user.id })
                    } else {
                        res.send("user not found !!");
                    }
                }
            })
        } else {
            res.redirect("/login");
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.post('/request_withdraw',async (req, res) => {
    try {
        if (Number(req.user.credits) >= 100) {
            sendmail('ankitkohli181@gmail.com', 'Request for withdraw credits in mybooks', 'name -' + req.user.name + ' , ' + 'id -' + req.user.id + ' , ' + 'email -' + req.user.username + ' , ' + 'payment_number -' + req.body.number + ' , ' + 'payment_type -' + req.body.payment_type)

            sendmail(req.body.username, 'Request pending for withdraw credits in mybooks', '', reply_mail("Your request for withdraw is sent to our team for processing. You will recieve your payment with in  2 to 3 days. To avoid any delays make sure your paytm or google pay number is working properly. "))

            res.send("sent")

            sendNotification("Message from team", "Your request for withdraw is sent to our team for processing. You will recieve your payment with in  2 to 3 days. To avoid any delays make sure your paytm or google pay number is working properly.", req.user.id)

            day = date();
            const message = new MESSAGE({
                msg: "Your request for withdraw is sent to our team for processing. You will recieve your payment with in  2 to 3 days. To avoid any delays make sure your paytm or google pay number is working properly.",
                time: day
            })
            USER.findOne({ _id: req.user.id }, (err, user) => {
                if(err){
                    log(err.stack, path.join(__dirname,'../error.log'))
                }else{
                    if(user){
                        user.notifications.push(message);
                        user.save();
                    }  
                }
            })
        } else {
            res.send("low_credits")
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/sitemap.xml', (req, res) => {
    // this is the source of the URLs on your site, in this case we use a simple array, actually it could come from the database
    try {
        BOOK.find({}, (err, books) => {
            if (err) {
                res.redirect("/error")
            } else {
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
            }
        })
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }


})

router.get('/contact',async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', '/contact')
        if (req.isAuthenticated()) {
            res.render("client/contact", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, status: "none" })
        } else {
            res.render("client/contact", { user_name: "", user_image: "", user_email: "", status: "block" })
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.get('/about',async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', '/about')
        if (req.isAuthenticated()) {
            res.render("client/about", { user_name: req.user.name, user_image: req.user.userimage, status: "none" })
        } else {
            res.render("client/about", { user_name: "", user_image: "", status: "block" })
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.get('/login',async (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/home")
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

router.get('/login_invalid_password',async (req, res) => {

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
        res.render("client/login", { message: "wrong password" })
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
        res.redirect("/home")
    } else {
        res.render("client/reset", { message: "Enter the email and OTP to reset your password", otp: "", email: "", password: "", isvalid: "" })
    }
})

router.get('/upload', (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', '/upload')
        if (req.isAuthenticated()) {
            res.render("client/upload", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, status: "none" })
        } else {
            res.render("client/upload", { user_name: "", user_image: "", user_email: "", status: "block" })
        }

    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.get('/success', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("client/success", { user_name: req.user.name, user_image: req.user.userimage, status: "none", message: "Thanks " + req.user.name + " for your contribution !" })
    } else {
        res.redirect("/home")
    }
})

router.get('/error', (req, res) => {
    res.render("error", { message: "" })
})

router.get('/reviews/:book_id', (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', "/reviews/" + req.params.book_id)
        BOOK.findOne({ _id: req.params.book_id }, (err, book) => {
            if(err){
                log(err.stack, path.join(__dirname,'../error.log'))
            }else{
                if (req.isAuthenticated()) {
                    res.render("client/reviews", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, user_id: req.user.id, status: "none", book: book })
                } else {
                    res.render("client/reviews", { user_name: "", user_image: "", user_email: "", user_id: "", status: "block", book: book })
                }
            }
            
        })
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/mybooks', async(req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', "/mybooks")
        if (req.isAuthenticated()) {
            BOOK.find({},(err, books) => {
                if(err){
                    log(err.stack, path.join(__dirname,'../error.log'))
                }else{
                    res.render("client/mybooks", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, user_id: req.user.id, status: "none", books: books, favbooks: req.user.fav_books })
                }
            })
        } else {
            res.redirect("/login-error")
        }
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/book/:book', async(req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', "/book/" + req.params.book)
        var isBook = false;
        const bookPromise = new Promise((resolve, reject) => {
            BOOK.findOne({ _id: req.params.book }, (err, book) => {
                if(book){
                    if (req.isAuthenticated()) {
                        res.render("client/book_detail", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, user_id: req.user.id, status: "none", book: book })
                    } else {
                        res.render("client/book_detail", { user_name: "", user_image: "", user_email: "", user_id: "", status: "block", book: book })
                    }
                    isBook = true;
                } 
                resolve(true)
            })
        })
        bookPromise.then(() => {
            if (!isBook) {
                BOOK.findOne({ book_name: req.params.book }, (err, book) => {
                    if(err){
                        log(err.stack, path.join(__dirname,'../error.log'))
                        res.redirect("/error")
                    }else{
                        if(book){
                            if (req.isAuthenticated()) {
                                res.render("client/book_detail", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, user_id: req.user.id, status: "none", book: book })
                            } else {
                                res.render("client/book_detail", { user_name: "", user_image: "", user_email: "", user_id: "", status: "block", book: book })
                            }
                        }
                    }
                })
            }
        })

    } catch (err) {
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
            BOOK.find({}).limit(14).skip(skip).exec(async(err, books) => {
                if(err){
                    log(err.stack, path.join(__dirname,'../error.log'))
                }else{
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
                }
                
            })

        } else {
            BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).limit(14).skip(skip).exec((err, books) => {
                if(err){
                    log(err.stack, path.join(__dirname,'../error.log'))
                }else{
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
                }       
            })
        }

    }catch (err) {
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

            if (req.isAuthenticated()) {

                if (search_Tag == "All books") {
                    BOOK.find({}).limit(14).exec((err, books) => {
                        if(err){
                            log(err.stack, path.join(__dirname,'../error.log'))
                        }else{
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
    
                                res.render("client/books", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, user_id: req.user.id, status: "none", category: search_Tag, books: books, gskip: get_gbooks })
    
                            });
                        }
                        
                    })
                } else {
                    BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).limit(14).exec((err, books) => {
                        if(err){
                            log(err.stack, path.join(__dirname,'../error.log'))
                        }else{
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
                                res.render("client/books", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, user_id: req.user.id, status: "none", category: search_Tag, books: books, gskip: get_gbooks })
                            });
                        }
                    })
                }
            } else {

                if (search_Tag == "All books") {
                    BOOK.find({}).limit(14).exec((err, books) => {
                        if(err){
                            log(err.stack, path.join(__dirname,'../error.log'))
                        }else{
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

                                res.render("client/books", { user_name: "", user_image: "", user_email: "", user_id: "", status: "block", category: search_Tag, books: books, gskip: get_gbooks })

                            });
                        }
                    })
                } else {
                    BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).limit(14).exec((err, books) => {
                        if(err){
                            log(err.stack, path.join(__dirname,'../error.log'))
                        }else{
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
                                res.render("client/books", { user_name: "", user_image: "", user_email: "", user_id: "", status: "block", books: books, category: search_Tag, gskip: get_gbooks })
    
                            });
                        }
                        
                    })
                }
            }
        }

    } catch (err) {
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

        BOOK.find({ searchTag: { $regex: search_item, $options: '$i' } }).limit(limit).skip(skip).exec((err, books) => {
            if(err){
                log(err.stack, path.join(__dirname,'../error.log'))
            }else{
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
                            resolve(true)
                            
                        } else {
                            log(error, path.join(__dirname,'../error.log')) 
                        }
                    });
                });
                gbooks_promise.then((result) => {
                    if (req.isAuthenticated()) {
                        if (books.length == 0 && page == 1) {
                            res.render("client/search", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, user_id: req.user.id, status: "none", search_item: search_Tag, books: "empty", page: "only_this_page" })
                        } else if (books.length < 14 && page == 1) {
                            res.render("client/search", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, user_id: req.user.id, status: "none", search_item: search_Tag, books: books, page: "only_this_page" })
                        } else if (books.length == 0) {
                            res.redirect("/search?search_item=" + search_Tag + "&page=1")
                        } else {
                            res.render("client/search", { user_name: req.user.name, user_image: req.user.userimage, user_email: req.user.username, user_id: req.user.id, status: "none", search_item: search_Tag, books: books, page: page })
                        }
                    } else {
                        if (books.length == 0 && page == 1) {
                            res.render("client/search", { user_name: "", user_image: "", user_email: "", user_id: "", status: "block", search_item: search_Tag, books: "empty", page: "only_this_page" })
                        } else if (books.length < 14 && page == 1) {
                            res.render("client/search", { user_name: "", user_image: "", user_email: "", user_id: "", status: "block", search_item: search_Tag, books: books, page: "only_this_page" })
                        } else if (books.length == 0) {
                            res.redirect("/search?search_item=" + search_Tag + "&page=1")
                        } else {
                            res.render("client/search", { user_name: "", user_image: "", user_email: "", user_id: "", status: "block", search_item: search_Tag, books: books, page: page })
                        }
                    }
                })
            }
        })
    } catch (err) {
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
            USER.findOne({ _id: req.user.id }, (err, user) => {
                if (!err) {
                    if(user){ res.send(user) }
                }else{
                    log(err.stack, path.join(__dirname,'../error.log'))
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
    // try {
        book_cover_drive_link = ""
        book_cover_cloudinary_link = ""
        book_cover_cloudinary_public_id = ""
        book_cover_link = ""
        book_cover_drive_id = ""
        pdf_file_link = ""
        pdf_file_drive_id = ""
        pdf_file_download_link = ""
        fileId = ""
        const pdf_folder_Id = drive_pdf(req.body.category)
        const cover_folder_Id = drive_cover(req.body.category)

        if (req.isAuthenticated()) {
            res.redirect("/success")

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


            searchTag = req.body.book_name + "-" + req.body.author_name + "-"
            let categories;
            categoriesArr=JSON.parse(req.body.categories)
            categoriesArr.forEach((ctgry)=>{
                searchTag+=ctgry.category+"-"+ctgry.subcategory
                categories.push(
                    new BOOK_CATEGORY({
                        book_category:ctgry.category,
                        book_subcategory:ctgry.subcategory
                    })
                )
            })
            searchTag = _.trim(_.toLower(searchTag)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '');
            book = new BOOK({
                uploader_name: req.user.name,
                uploader_id: req.user.id,
                book_name: req.body.book_name,
                author_name: req.body.author_name,
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

            console.log(book)
            book.save(function(err, saved_book) {
                if(err){
                    log(err.stack, path.join(__dirname,'../error.log'))
                }else{
                    under_review = new BOOK_UNDER_REVIEW({
                        book_id: saved_book.id,
                        book_category: req.body.category,
                        user_id: req.user.id,
                        book_name: req.body.book_name
                    })
                    under_review.save();
                }
            });

            USER.findOneAndUpdate({ _id: req.user.id }, { $inc: { booksUploaded: 1 } }, { new: true }, (err, user) => { if (err) {  } })

            sendNotification("Book uploaded successfully", "Your book has been added to our review section once its approved you will get the credits", req.user.id)

        } else {
            res.redirect("/login-error")
        }
    // } catch (err) {
    //     log(err.stack, path.join(__dirname,'../error.log'))
    //     sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    // }
})

router.post('/addTofav/:book_id',async (req, res) => {
    try {
        var isFav = false

        if (req.isAuthenticated()) {
            const favbook = new FAVBOOK({
                book_id: req.params.book_id
            })
            try {
                const bookPromise = new Promise((resolve, reject) => { // this is used because all function of mongoose are async 
                    USER.findOne({ _id: req.user.id }, (err, user) => {
                        if (!err) {
                            if(user){
                                user.fav_books.forEach(function(fav_bookid) {
                                    if (fav_bookid.book_id === req.params.book_id) {
                                        isFav = true;
                                        // console.log("found")
                                    }
                                })
                            }
                            resolve(true)
                        }else{
                            log(err.stack, path.join(__dirname,'../error.log'))
                        }
                    });
                })
                bookPromise.then(function(result) {
                    if (result) {
                        if (isFav) {
                            USER.findOneAndUpdate({ _id: req.user.id }, { $pull: { fav_books: { book_id: req.params.book_id } } }, { new: true }, function(err, user) {
                                if(err){
                                    log(err.stack, path.join(__dirname,'../error.log'))
                                }else{
                                    if(user){
                                        if (user.fav_books.length == 0) {
                                            res.send("deleted_empty")
                                        } else {
                                            res.send("deleted")
                                        }
                                    }
                                }
                            });
                        } else {
                            USER.findOne({ _id: req.user.id }, (err, user) => {
                                if(err){
                                    log(err.stack, path.join(__dirname,'../error.log'))
                                }else{
                                    if(user){
                                        user.fav_books.push(favbook);
                                        user.save();
                                        res.send("added")
                                    }  
                                }
                            })
                        }
                    }
                })
            } catch (error) {
                log(error, path.join(__dirname,'../error.log'))
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
                time: day,
                message: req.params.message,
            })
            BOOK.findOne({ _id: req.params.book_id }, (err, book) => {
                if(err){
                    log(err.stack, path.join(__dirname,'../error.log'))
                }else{
                    if(book){
                        book.reviews.push(review)
                        book.save();
                        res.send(book)
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
            day = date();
            var contact = new CONTACT({
                name: req.body.name,
                email: req.body.email,
                message: req.body.message,
                date: day,
                userID: req.user.id
            })
            contact.save();

            const message = new MESSAGE({
                msg: "Thanks for contacting, us we will review and reply your message as soon as possible.",
                time: day
            })
            USER.findOne({ _id: req.user.id }, (err, user) => {
                if(err){
                    log(err.stack, path.join(__dirname,'../error.log'))
                }else{
                    if(user){
                        user.notifications.push(message);
                        user.save();
                    } 
                }
            })

            sendNotification(": Thanks for contacting us.", "We will review and reply to your message as soon as possible", req.user.id)

            sendmail(req.body.email, ': Thanks for contacting us (myBooks)', '', contact_mail())

            sendmail("mybooks.webmaster@gmail.com", 'New message from ' + req.body.email, '', reply_mail(req.body.message))

            res.render("client/success", { user_name: req.user.name, user_image: req.user.userimage, status: "none", message: "Thanks " + req.body.name + " for your response we will contact you as soon as possible !" })

        } else {
            day = date();
            var contact = new CONTACT({
                name: req.body.name,
                email: req.body.email,
                message: req.body.message,
                date: day,
            })
            contact.save();

            sendmail(req.body.email, ': Thanks for contacting us (myBooks)', '', contact_mail())

            sendmail("mybooks.webmaster@gmail.com", 'New message from ' + req.body.email, '', reply_mail(req.body.message))

            res.render("client/success", { user_name: "", user_image: "", status: "block", message: "Thanks " + req.body.name + " for your response we will contact you as soon as possible !" })

        }


    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})

router.post('/signup', (req, res) => {
    try {
        if (req.body.referral != "") {
            USER.findOneAndUpdate({ _id: req.body.referral }, { $inc: { credits: 1 } }, { new: true }, (err, user) => { if (err) {  } })
            USER.findOneAndUpdate({ _id: req.body.referral }, { $inc: { refferals: 1 } }, { new: true }, (err, user) => { if (err) {  } })
        }

        USER.register({ username: req.body.username, email: req.body.username, name: req.body.name, userimage: "/images/user-icon.png", searchtag: _.trim(_.toLower(req.body.name)).replace(/[&\/\\#,+()$~%.^@!_=`'":*?<>{} ]/g, '') + "-" + req.body.username }, req.body.password, (err) => {
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
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.post('/login', (req, res) => {
    try {
        const old_user = new USER({
            username: req.body.username,
            password: req.body.password
        })
        USER.findOne({ username: req.body.username }, (err, user) => {
            if(err){
                log(err.stack, path.join(__dirname,'../error.log'))
            }else{
                if (user) {
                    if (user.googleId) {
                        res.send({ message: "You are already registered try to sign in with google", status: "401" })
                    } else {
                        req.login(old_user, (err) => {
                            if (!err) {
                                if (user.googleId) {
                                    res.send({ message: "You are already registered try to sign in with google", status: "401" })
                                } else {
                                    passport.authenticate("local")(req, res, () => {
                                        client.get(req.ip+'-currloc', function(err, response) {
                                            if(err){ 
                                                res.send({ message: "Login successful, redirecting...", status: "200", authUrl: '/home' })
                                            }else{
                                                res.send({ message: "Login successful, redirecting...", status: "200", authUrl: response })
                                            }
                                        });
                                    })
                                }
                            }else{
                                log(err.stack, path.join(__dirname,'../error.log'))
                            }
                        })
                    }
                } else {
                    res.send({ message: "Wrong credentials try to enter correct email and password", status: "401" })
                }
            }
        })
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

})
router.post("/reset/:email", async(req, res) => {
    try {
        USER.findOne({ username: req.params.email }, async(err, user) => {
            if(err){
                log(err.stack, path.join(__dirname,'../error.log'))
            }else{
                if (user) {
                    if (user.googleId) {
                        res.send("already_g")
                    } else {
                        otp.startOTPTimer(new Date().getTime());
                        otp.setOTPDigits(4);

                        await sendOTP(req.params.email, otp.generateOTP(req.params.email, 10), "OTP for reset of your account")

                        res.send("ok")
                    }
                } else {
                    res.send("notfound")
                }
            }
        })
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
                        USER.updateOne({ username: req.body.username }, { $unset: { tmp_otp: "" } }, (err) => {
                            if (err) {
                                log(err.stack, path.join(__dirname,'../error.log'))
                            } else {
                                clearTimeout(otpTimer)
                            }
                        })
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
        if (req.user.api_status == true) {
            USER.updateOne({ "_id": req.user.id }, { $set: { api_status: false } }).then(() => {
                res.send("disabled")
            })

        } else {
            if (req.user.api_key == null) {
                API_KEY = rand.generate(30)
                USER.updateOne({ "_id": req.user.id }, { $set: { api_key: API_KEY, api_status: true } }).then(() => {
                    res.send(API_KEY)
                })

            } else {
                USER.updateOne({ "_id": req.user.id }, { $set: { api_status: true } }).then(() => {
                    res.send(req.user.api_key)
                })
            }
            searchtag = ""
            const user_promise = new Promise((resolve, reject) => {
                USER.findOne({ _id: req.user.id }, (err, user) => {
                    if (!err) {
                        if(user){
                            searchtag += user.searchtag;
                            resolve(true)
                        }
                    }else{     
                        log(err.stack, path.join(__dirname,'../error.log'))
                    }
                })
            })
            user_promise.then((result) => {
                USER.updateOne({ _id: req.user.id }, { $set: { ismember: true, searchtag: searchtag + "-apiuser-apienabled-apiclient" } }, (err) => { if (err) {  } })
            })
        }
    } else {
        res.send("unauthorized")
    }
})

router.get("/error.log",(req, res)=>{
    res.sendFile(path.join(__dirname,"../error.log"))
})


module.exports=router
