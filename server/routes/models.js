const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const path = require("path")
const passportLocalMongoose = require("passport-local-mongoose")
mongoose.connect("mongodb+srv://admin-ankit:root@cluster0.rxzj6.mongodb.net/mybooks_v2", { useUnifiedTopology: true, useNewUrlParser: true })
// mongoose.connect("mongodb://localhost:27017/mybooks",{ useUnifiedTopology: true ,useNewUrlParser:true})
mongoose.set("useCreateIndex", true)

const favbooksSchema = new mongoose.Schema({
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'book', required: true, index:{unique:true}},
    dateAdded:{ type: Date, default: Date.now, required: true }
})
const notificationSchema = new mongoose.Schema({
    msg: { type: String,required: true},
    type:{
        type:String,
        enum:['security','account','message','notify','subscription','payment'],
        default:'message',
        required: true
    },
    createdAt: { type: Date, default: Date.now, required: true },
})

const bookUploaded= new mongoose.Schema({
    bookId:{ type: mongoose.Schema.Types.ObjectId, ref: 'book', required: true, index:{unique:true}},
    uploadDate:{ type: Date, default: Date.now, required: true }
})
const userSchema = new mongoose.Schema({
    name: { type: String,required: true} ,
    isGoogleUser:{type: Boolean,required: true,default: false},
    googleId: { 
        type:String,index:{unique:true},
        required:function() {
            return this.isGoogleUser==true;
        }
    },
    currStatus:{
        type:String,
        enum:['online','offline'],
        default:'offline'
    },
    userimage: { 
        type:String,
        required:function() {
            return this.isGoogleUser==true;
        }
    },
    username: { type: String,required: true,index:{unique:true}},
    isPremiumUser: { type: Boolean,required: true,default:false },
    email: { type: String,required: true,index:{unique:true}},
    fav_books: [favbooksSchema],
    notifications: [notificationSchema],
    ismember:{type:Boolean,required:true,default:false},
    membershipType: {type:String,enum:['admin','naive_user','standalone_user','none'],
        required:function(){
            return this.ismember;
        }
    },
    searchtag: { type: String,required: true},
    SW_subscription: JSON,
    account_record:{ 
        createdAt: { type: Date, default: Date.now, required: true },
        lastLogin: { type: Date, default: Date.now, required: true },
        accntStatus:{
            status:{
                type:String,
                enum:['enabled','disabled','blocked','tempblocked'],
                required:true,
                default:'enabled'
            },
            statusInfo:{ 
                type:String,
                required:function(){
                    return this.account_record.accntStatus.status!='enabled'
                }
            }
        },
        credits: { 
            type: Number, default: 0, required: true
        },
        refferals: { 
            type: Number, default: 0, required: true
        },
        q_resolved: { 
            type: Number, default: 0,
            required:function() {
                return this.ismember==true;
            }
        },
        booksUploaded: [bookUploaded],
    }
})
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)

const apiSchema = new mongoose.Schema({
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index:{unique:true}},
    api_key: { type:String,required:true,index:{unique:true} },
    api_status: {
        type:String,
        enum:['enabled','disabled','blocked'],
        default:'enabled'
    },
    api_status_info:{
        type:String,
        required:function(){
            return this.api_status=="blocked"
        }
    },
    api_requests: {type:Number,default:0,required:true},   
    createdAt:{ type: Date, default: Date.now, required: true }
})

const docSchema = new mongoose.Schema({
    user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    appType:{ 
        type: String,
        enum:['docScanner','docConverter','pdfMerger','tempStore'],
        required: true
    },
    docLink:{type: String, required: true},
    createdAt:{ type: Date, default: Date.now, required: true }
})

const adminSchema = new mongoose.Schema({
    username: { type: String,required: true, index:{unique:true}},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index:{unique:true}},
    unicode: { type: String,required: true},
    createdAt: { type: Date, default: Date.now, required: true },
    lastLogin: { type: Date, default: Date.now, required: true },
    lastOnline: { type: Date, default: Date.now },
    accntStatus:{
        type:String,
        enum:['enabled','disabled','blocked','tempblocked'],
        required:true,
        default:'enabled'
    }
})

const reviewSchema = new mongoose.Schema({
    user_commented: { type: String,required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    message: { type: String,required: true }
})

const categorySchema=new mongoose.Schema({
    book_category: { type: String,required: true },
    book_subcategory: { type: String,required: true }
})

const tagSchema=new mongoose.Schema({
    tagName: { type: String,required: true },
    tagType: {
        type:String,
        enum: ['featuredBook','topBook','mostCommented','mostLiked','recentUpload','mostPurchased','mostFamous','normalTag'],
        default:'normalTag',
        required: true,
    },
    priority:{
        type:Number,
        max: 10,
        default:1
    }
})

function tagLimit(val) {
    return val.length <= 20;
}

const bookSchema = new mongoose.Schema({

    uploader_name: { type: String,required: true },
    uploader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    book_name: { type: String,required: true },
    publisher:String,
    author:[String],
    book_description: String,
    category:[categorySchema],
    book_cover_drive_link: { type: String,required: true},
    book_cover_drive_id: { type: String,required: true},
    book_cover_cloudinary_public_id: { type: String,required: true},
    book_cover_cloudinary_link: { type: String,required: true},
    book_file_link: { type: String,required: true},
    book_file_download_link: { type: String,required: true},
    book_file_drive_id: { type: String,required: true},
    book_tags: { type: [tagSchema],validate: [tagLimit, 'book tags exceeds the limit of 20']},
    searchTag: { type: String,required: true},
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    updatedId: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    reviews: [reviewSchema]
})

const book_under_review_schema = new mongoose.Schema({
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'book', required: true},
    isUpdate: {type: Boolean,required:true},
    createdAt: { type: Date, default: Date.now, required: true }
})

const deletedBookSchema = bookSchema

const contactSchema = {
    name: { type: String,required: true},
    email: { type: String,required: true},
    message: { type: String,required: true},
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    createdAt: { type: Date, default: Date.now, required: true }
};

const tokenSchema = {
    type: { type: String,required: true},
    refreshToken: { type: String,required: true},
    updatedAt: { type: Date, default: Date.now, required: true }
};

const solvedContactSchema = {
    name: { type: String,required: true},
    email: { type: String,required: true},
    adminID: { type: mongoose.Schema.Types.ObjectId, ref: 'admin_user', required: true},
    message: { type: String,required: true},
    resolved_date: { type: Date, default: Date.now, required: true },
};

const CONTACT = mongoose.model("contact", contactSchema);
const TOKEN = mongoose.model("refreshToken", tokenSchema);
const RESOLVED_CONTACT = mongoose.model("resolved_contact", solvedContactSchema);

const feedbackSchema = {
    message:{ type: String,required: true},
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    createdAt:{ type: Date, default: Date.now, required: true }
};

const FEED = mongoose.model("feedback", feedbackSchema);
const USER = new mongoose.model('user', userSchema)
const ADMINUSER = new mongoose.model('admin_user', adminSchema)
const APIUSER = new mongoose.model('api_user', apiSchema)
const DOCUSER = new mongoose.model('document_user', docSchema)
const BOOK = new mongoose.model('book', bookSchema)
const BOOK_CATEGORY = new mongoose.model('book_category', categorySchema)
const BOOK_UPLOAD = new mongoose.model('book_upload', bookUploaded)
const TAG = new mongoose.model('book_tags', tagSchema)
const BOOK_UNDER_REVIEW = new mongoose.model('books_under_review', book_under_review_schema)
const DELETED_BOOK = new mongoose.model('deleted_book', deletedBookSchema)
const REVIEW = new mongoose.model('review', reviewSchema)
const FAVBOOK = new mongoose.model('favbook', favbooksSchema)
const MESSAGE = new mongoose.model('notification', notificationSchema)

module.exports={
    CONTACT,TOKEN,RESOLVED_CONTACT,FEED,USER,ADMINUSER,BOOK,TAG,
    BOOK_CATEGORY,BOOK_UNDER_REVIEW,DELETED_BOOK,REVIEW,FAVBOOK,
    MESSAGE,APIUSER,DOCUSER,BOOK_UPLOAD
}