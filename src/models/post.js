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
        default:"https://cdn.phototourl.com/free/2026-07-03-e6eab32d-415c-4f16-9352-2858b9b316bb.png",
    },
    likes:{
        type:Number,
        default:0,
        min:0,
    },
    comments:{
        type:[commentSchema],
    }
},{timestamps:true})

module.exports = mongoose.model("post",postSchema);