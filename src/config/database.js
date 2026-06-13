const mongoose = require("mongoose");

const connectDB = async ()=>{
    
    await mongoose.connect("mongodb+srv://ashishojha:vFZz2CdZZIhqPRqw@ashishojha.b7rz7ll.mongodb.net/Nexa");

}

module.exports = connectDB 