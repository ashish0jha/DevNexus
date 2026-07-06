const { default: mongoose } = require("mongoose");

const commentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    text:{
        type:String,
        max:150,
    },
},{timestamps:true})

const postSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    content:{
        type:String,
        maxLength:1000,
        required:true,
    },
    imageUrl:{
        type:String,
        default:"https://res.cloudinary.com/ysglxchz/image/upload/v1783314664/devTinder_Posts/bknnb3rjzl5z1mxo3b4c.png",
    },
    likes:{
        type:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}]
    },
    comments:{
        type:[commentSchema],
    }
},{timestamps:true})

module.exports = mongoose.model("post",postSchema);