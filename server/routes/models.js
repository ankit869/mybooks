const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const path = require("path")
const passportLocalMongoose = require("passport-local-mongoose")
mongoose.connect("mongodb+srv://admin-ankit:root@cluster0.rxzj6.mongodb.net/mybooks", { useUnifiedTopology: true, useNewUrlParser: true })
    //mongoose.connect("mongodb://localhost:27017/mybooks",{ useUnifiedTopology: true ,useNewUrlParser:true})
mongoose.set("useCreateIndex", true)

const favbooksSchema = new mongoose.Schema({
    book_id: String
})
const notificationSchema = new mongoose.Schema({
    msg: String,
    createdAt: { type: Date, default: Date.now },
    time: String
})
const userSchema = new mongoose.Schema({
    name: String,
    googleId: String,
    userimage: String,
    password: String,
    unicode: String,
    email: String,
    fav_books: [favbooksSchema],
    notifications: [notificationSchema],
    booksUploaded: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    refferals: { type: Number, default: 0 },
    q_resolved: { type: Number, default: 0 },
    ismember: Boolean,
    searchtag: String,
    SW_subscription: JSON,
    api_key: String,
    api_status: Boolean,
    api_requests: Number,
    tmp_otp: String
})
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)

const adminSchema = new mongoose.Schema({
    username: String,
    userID: String,
    unicode: String,
})

const reviewSchema = new mongoose.Schema({
    user_commented: String,
    time: String,
    message: String
})

<<<<<<< HEAD
const categorySchema = new mongoose.Schema({
    book_category: String,
    book_subcategory: String,
})


=======
const categorySchema=new mongoose.Schema({
    book_category:String,
    book_subcategory:String
})
>>>>>>> ce065de483734954165f26ddab74e8ff2a23eae2
const bookSchema = new mongoose.Schema({
    uploader_name: String,
    uploader_id: String,
    book_name: String,
    author_name: String,
    book_description: String,
<<<<<<< HEAD
    category: [categorySchema],
=======
    book_category: String,
    book_subcategory: String,
    category:[categorySchema],
>>>>>>> ce065de483734954165f26ddab74e8ff2a23eae2
    book_cover_drive_link: String,
    book_cover_drive_id: String,
    book_cover_cloudinary_public_id: String,
    book_cover_cloudinary_link: String,
    book_file_link: String,
    book_file_download_link: String,
    book_file_drive_id: String,
    tags: String,
    searchTag: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    updatedId: String,
    reviews: [reviewSchema]
})

const book_under_review_schema = new mongoose.Schema({
    book_id: String,
    book_name: String,
    user_id: String,
    category: [categorySchema],
    isUpdate: Boolean
})

const deletedBookSchema = new mongoose.Schema({
    uploader_name: String,
    uploader_id: String,
    book_name: String,
    author_name: String,
    book_description: String,
<<<<<<< HEAD
    category: [categorySchema],
=======
    book_category: String,
    book_subcategory: String,
    category:[categorySchema],
>>>>>>> ce065de483734954165f26ddab74e8ff2a23eae2
    book_cover_drive_link: String,
    book_cover_drive_id: String,
    book_cover_cloudinary_public_id: String,
    book_cover_cloudinary_link: String,
    book_file_link: String,
    book_file_download_link: String,
    book_file_drive_id: String,
    tags: String,
    searchTag: String,
    deletedAt: { type: Date, default: Date.now },
    admin_userID: String,
    reviews: [reviewSchema]
})
const contactSchema = {
    name: String,
    email: String,
    message: String,
    date: String,
    userID: String
};
const tokenSchema = {
    type: String,
    refreshToken: String,
    updatedAt: { type: Date, default: Date.now }
};
const solvedContactSchema = {
    name: String,
    email: String,
    message: String,
    resolved_date: { type: Date, default: Date.now },
};
const CONTACT = mongoose.model("contact", contactSchema);
const TOKEN = mongoose.model("refreshToken", tokenSchema);
const RESOLVED_CONTACT = mongoose.model("resolved contact", solvedContactSchema);

const feedbackSchema = {
    message: String
};
const FEED = mongoose.model("feedback", feedbackSchema);
const USER = new mongoose.model('user', userSchema)
const ADMINUSER = new mongoose.model('admin user', adminSchema)
const BOOK = new mongoose.model('book', bookSchema)
const BOOK_CATEGORY = new mongoose.model('book_category', categorySchema)
const BOOK_UNDER_REVIEW = new mongoose.model('books_under_review', book_under_review_schema)
const DELETED_BOOK = new mongoose.model('deleted book', deletedBookSchema)
const REVIEW = new mongoose.model('review', reviewSchema)
const FAVBOOK = new mongoose.model('favbook', favbooksSchema)
const MESSAGE = new mongoose.model('notification', notificationSchema)

<<<<<<< HEAD
module.exports={CONTACT,TOKEN,RESOLVED_CONTACT,FEED,USER,ADMINUSER,BOOK_CATEGORY,BOOK,BOOK_UNDER_REVIEW,DELETED_BOOK,REVIEW,FAVBOOK,MESSAGE}
=======
module.exports={CONTACT,TOKEN,RESOLVED_CONTACT,FEED,USER,ADMINUSER,BOOK,BOOK_CATEGORY,BOOK_UNDER_REVIEW,DELETED_BOOK,REVIEW,FAVBOOK,MESSAGE}
>>>>>>> ce065de483734954165f26ddab74e8ff2a23eae2
