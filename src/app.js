const express = require('express');
const connectDB = require("./config/database")
const {UserModel} = require("./models/User");
const { validateSignUpData } = require('./utils/validate');
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/Auth")

const app = express();

app.use(express.json());
app.use(cookieParser());

app.post("/signup",async (req,res)=>{
    try{
        //api level Validation 
        validateSignUpData(req);

        const { firstName , lastName , emailId , password } = req?.body;

        //encrypt the password
        const hashCode = await bcrypt.hash(password,10);

        const user = new UserModel({
            firstName,
            lastName,
            emailId,
            password:hashCode
        })

        await user.save();
        res.send("User Added SuccesfullY");
    }
    catch(err){
        res.status(400).send("Error : "+ err.message)
    }
})

app.post("/login",async(req, res)=>{
    try{
        const { emailId, password } = req.body;
        
        const user = await UserModel.findOne({ emailId : emailId });

        if(!user){
            throw new Error(" Invalid credentials ")
        }

        const isPasswordCorrect = user.validatePassword(password)

        if(isPasswordCorrect){
            //creating a jwt token 
            const token = user.getJWT();

            res.cookie("token",token , {
                expires : new Date(Date.now() + 7*3600000)
            });

            res.send("User Logged In");
        }else{
            throw new Error(" Invaid Credentials ");
        }
    }
    catch(err){
        res.status(400).send("Error : " + err.message);
    }
})

app.get("/profile", userAuth ,async (req,res)=>{
    try{
        const user = req.user;
        res.send(user);
    }
    catch(err){
        res.status(400).send("Something is wrong" + err.message);
    }
})

app.post("/sendConnectionRequest",userAuth , async(req,res)=>{
    try{

        const user = req.user;

        res.send(`${user.firstName} has sent the connection request`);

    }catch(err){

    }
})

app.patch("/user/:userId",async(req,res)=>{
    try{
        const userId = req.params?.userId;

        const data = req.body;

        const ALLOWED_UPDATES = ["phototUrl","gender","age","skills"];

        const isUpdatedAllowed = Object.keys(data).every((k)=> ALLOWED_UPDATES.includes(k));

        if(!isUpdatedAllowed){
            throw new Error("Update not Allowed");
        }

        if(data?.skills.length>10){
            throw new Error("Skills cannot more than 10");
        }

        await UserModel.findByIdAndUpdate({_id:userId},data,{ runValidators:true })

        res.send("Updated Sucessfuly")
    }
    catch(err){
        res.status(400).send("Error : "+ err.message);
    }
    
})

app.delete("/user/:userId",async (req,res)=>{
    try{
        const userId = req.params.userId;

        await UserModel.findByIdAndDelete(userId);

        res.send("user Deleted");
    }
    catch(err){
        res.status(400).send("Something is Wrong");
    }
})

app.get("/feed",async (req, res)=>{
    try{
        const users = await UserModel.find({});
        res.send(users);
    }
    catch(err){
        res.status(400).send("Something is wrong"); 
    }
})

connectDB()
    .then(()=>{
        console.log("Database Connected Succesfully");
        app.listen(3000,()=>{
            console.log("Server Started at Port 3000");
        })
    })
    .catch((err)=>{
        console.log("Error : DataBase can't Connect ");
    })