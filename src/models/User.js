const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50,
    },
    lastName: {
        type: String,
        max: 50
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Weak Password");
            }
        }
    },
    age: {
        type: Number,
        min: 18,
        max:100,
    },
    gender: {
        type: String,
        enum: ["male", "female", "others"]
        // validate(value){
        //     if(!["male","female","others"].includes(value)){
        //         throw new Error("Invalid Gender")
        //     }
        // }
    },
    photoUrl: {
        type: String,
        default: "https://kristalle.com/wp-content/uploads/2020/07/dummy-profile-pic-1.jpg",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid Url Link");
            }
        }
    },
    about: {
        type: String,
        default: "Hey! , I am Using WhatsApp",
        maxLength: 500,
    },
    skills: {
        type: [String],
    }
}, { timestamps: true })

userSchema.methods.getJWT = async function () {
    const user = this;

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY , { expiresIn: '7d' });

    return token;
}

userSchema.methods.validatePassword = async function (userEnteredPassword) {
    const user = this;
    const storedHashCode = user.password;

    const isPasswordValid = await bcrypt.compare(userEnteredPassword, storedHashCode);

    return isPasswordValid;
}

const UserModel = mongoose.model("User", userSchema);

module.exports = { UserModel };