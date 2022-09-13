const express = require('express');
const sharp= require('sharp')
const multer = require("multer");
var rand = require("random-key");
const fs = require('fs');
const {client,redis_setkey}=require('./redis_conf.js')
const _ = require("lodash");
const { readdir } = require('fs/promises');
const router = express.Router();
var rimraf = require("rimraf");
const {USER,IMGAPIUSER,UPLD_API_IMG}=require('./models.js');
const sendNotification=require('./notification.js')
const reply_mail = require("../../mail_templates/reply_template.js");
const sendmail = require('./mail.js')
const log = require('log-to-file');
const path = require("path")
async function api_requests(key) {
    IMGAPIUSER.updateOne({ "api_key": key }, { $inc: { "api_requests": 1 } }, { new: true }, (err) => { if (err) {  } })
}

router.get('/img-api/img/:key/:image', (req, res) => {
    imgID=path.parse(req.params.image).name;     //=> "hello"
    imgExt=path.parse(req.params.image).ext;      //=> ".html"
    IMGAPIUSER.findOne({ "api_key": req.params.key }, (err, user) => {
        if(err){
            log(err, path.join(__dirname,'../error.log'))
        }else{
            if (user) {
                if(user.api_status=="enabled"){
                    api_requests(req.params.key)
                    res.sendFile(path.join(__dirname,"../ApiImgs/"+imgID+imgExt),(err)=>{
                        if(err){
                            console.log(err)
                           res.send("ERROR !! check the url of image again.")
                        }
                    })
                }else{
                    res.send("Your API-KEY is currently disabled")
                }
               
            } else {
                res.send("ERROR !! Please try again with correct api key.")
            }
        }
    })
})


router.get('/img-api/images/:key', (req, res) => {
    IMGAPIUSER.findOne({ "api_key": req.params.key }, (err, user) => {
        if(err){
            log(err, path.join(__dirname,'../error.log'))
        }else{
            if (user) {
                if (user.api_status=="enabled") {
                    imgs=[]
                    user.images.forEach((img)=>{
                        image={
                            Id:img.id,
                            name:img.ImgOriginalName,
                            type:img.ImgOriginalType,
                            url:`https://mybooks-free.com/img-api/img/${user.api_key}/${img.id+(img.ImgOriginalType).replace("image/",".")}`

                        }
                        imgs.push(image)
                    })
                    res.send(imgs)
                } else {
                    res.send("Your API-KEY is currently disabled")
                }
            } else {
                res.send("ERROR !! Please try again with correct api key")
            }
        }
    })
})

const findByName = async (dir, name) => {
    const matchedFiles = [];

    const files = await readdir(dir);

    for (const file of files) {
        const filename = path.parse(file).name;

        if (filename === name) {
            matchedFiles.push(file);
        }
    }

    return matchedFiles;
};

router.delete("/img-api/img/delete/:key/:imageID",(req,res) => {
    if(req.isAuthenticated()){
        IMGAPIUSER.findOneAndUpdate({ api_key: req.params.key }, { $pull: { images: { _id: req.params.imageID } } }, { new: true },(err,user)=>{
            if(err){
                log(err, path.join(__dirname,'../error.log'))
                res.sendStatus(404)
            }else{
                findByName(path.join(__dirname,`../ApiImgs/`),req.params.imageID).then((files) => {
                    files.forEach((file) =>{
                        fs.unlink(path.join(__dirname,`../ApiImgs/`)+file, err => {
                            if (err) {
                               log(err, path.join(__dirname,'../error.log'))
                            };
                        });
                    })
                });
                res.sendStatus(200)
            }
        });  
    }else{
        res.send("unauthorized")
    }
})
const ApiImgStore = multer.diskStorage({
    destination: function(req, file, callback) {
        if (!fs.existsSync(path.join(__dirname,'../tmp'))) {
            fs.mkdirSync(path.join(__dirname,'../tmp'))
        }
        callback(null, path.join(__dirname,'../tmp'));
    },
    filename: function(req, file, callback) {
        IMGname =(req.ip).replace(/[.: ]/g, '')+file.originalname;
        callback(null, IMGname);
    }
});

const upld = multer({
    storage: ApiImgStore
})

router.post('/img-api/upload', upld.array('images', 1000), (req, res) => {

    try {
        if (!req.files) {
            res.send("No-files-received")
        } else {
            if(req.header("api-key")=="demo"){
                images=[]
                for (i = 0; i < parseInt(req.files.length); i++) {
                    filename=req.files[i].originalname
                    filetype=req.files[i].mimetype
                    var img=new UPLD_API_IMG({
                        ImgOriginalName:filename,
                        ImgOriginalType:filetype
                    })
                    images.push({
                        Id:img.id,
                        OriginalName:filename,
                        OriginalType:filetype,
                        ImgUrl:"URL of this image",
                        uploadedAt:img.uploadedAt
                    })
                }
                res.send(images)
                
            }else{
                IMGAPIUSER.findOne({ "api_key": req.header("api-key") },async (err, user) => {
                    if(err){
                        log(err, path.join(__dirname,'../error.log'))
                    }else{
                        if (user) {
                            if (!fs.existsSync(path.join(__dirname,'../ApiImgs'))) {
                                fs.mkdirSync(path.join(__dirname,'../ApiImgs'))
                            }
                            if(user.api_status=="enabled"){
                                images=[];
                                var filesSaved=0;
                                for (i = 0; i < parseInt(req.files.length);i++) {
                                    filename=req.files[i].originalname
                                    filetype=req.files[i].mimetype


                                    var img= new UPLD_API_IMG({
                                        ImgOriginalName:filename,
                                        ImgOriginalType:filetype
                                    })         
                                    pushImage(img)
                                        
                                }

                                async function pushImage(img){
                                    const tempfile = path.join(__dirname,"../tmp/"+(req.ip).replace(/[.: ]/g, '')+filename)                    
                                    const file = path.join(__dirname,"../ApiImgs/"+img.id+".webp")

                                    sharp(req.files[0].path).toFile(path.join(__dirname,"../ApiImgs/"+img.id+".webp"), (err, info) => {
                                        if (err) {
                                            log(err, path.join(__dirname,'../error.log'))
                                        }else{
                                            if (fs.existsSync(file)) {
                                                user.images.push(img)
                                                var usrImgObj= {
                                                    Id:img.id,
                                                    OriginalName:img.ImgOriginalName,
                                                    OriginalType:img.ImgOriginalType,
                                                    ImgUrl:`https://mybooks-free.com/img-api/img/${user.api_key}/${img.id}.webp`,
                                                    uploadedAt:img.uploadedAt
                                                }
            
                                                images.push(usrImgObj)
                                                fs.unlink(tempfile, err => {
                                                    if (err) {
                                                        log(err, path.join(__dirname,'../error.log'))
                                                    }else{
                                                        filesSaved++;
                                                        if(filesSaved==req.files.length){
                                                            res.send(images)
                                                            saveUser()
                                                        }
                                                    }
                                                });
                                                
                    
                                            } else {
                                                console.log("DOES NOT EXISTS :" + file)
                                            }
                            
                                            
                                        }
                                    })

                                }
                                function saveUser(){
                                    user.save()
                                }

                            }else{
                                res.send("Your API-KEY is currently disabled")
                            }
                            

                        } else {
                            res.send("ERROR !! Please try again with correct api key")
                        }
                    }
                })
            }

        }
    } catch (err) {
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }

});

router.patch('/img-api/toggle',async (req, res) => {
    if (req.isAuthenticated()) {
        let apiuser=await IMGAPIUSER.findOne({userId:req.user.id});
            
        if(apiuser){
            if(apiuser.api_status=="enabled") {
                apiuser.api_status="disabled";
                apiuser.save()
                USER.updateOne({_id:req.user.id},{ $set: { searchtag: req.user.searchtag.replace('-imgapiuser-imgapienabled', '-imgapiuser-imgapidisabled')}}).then(()=>{
                    res.send("disabled")
                })
            }else{
                apiuser.api_status="enabled";
                apiuser.save()
                USER.updateOne({_id:req.user.id},{ $set: { searchtag: req.user.searchtag.replace('-imgapiuser-imgapienabled', '-imgapiuser-imgapienabled')}}).then(()=>{
                    res.send(apiuser.api_key)
                })
            }

        }else{
            
            API_KEY = rand.generate(30)
            newApiUser=new IMGAPIUSER({
                userId:req.user.id,
                api_key:API_KEY
            })

            USER.updateOne({_id:req.user.id},{ $set: { searchtag: req.user.searchtag+'-imgapiuser-imgapienabled'}}).then(()=>{
                newApiUser.save().then(()=>{
                    res.send(API_KEY)
                });
            })
        }
            
    } else {
        res.send("unauthorized")
    }
})

router.get('/img-api',async (req, res) => {
    try {
        redis_setkey(req.ip+'-currloc', '/img-api')
        if (req.isAuthenticated()) {
            let apiuser=await IMGAPIUSER.findOne({userId:req.user.id});
            if(apiuser){
                res.render("webapps/image_api", { api_user: apiuser})
            }else{
                res.render("webapps/image_api", { api_user: "" });
            } 
        } else {
            res.render("webapps/image_api", { api_user: "not_a_user" });
        } 
    } catch (err) {
        res.redirect("/error")
        log(err.stack, path.join(__dirname,'../error.log'))
        sendmail("ankitkohli181@gmail.com", 'Error Occured in (mybooks)', '', reply_mail(err.stack));
    }
})

router.get('/private/img_api_detail',async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            let apiuser=await IMGAPIUSER.findOne({ userId: req.user.id }); 
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
