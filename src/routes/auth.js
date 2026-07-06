const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require('../utils/validate');
const bcrypt = require("bcrypt");
const {UserModel} = require("../models/User");
const { userAuth } = require("../middlewares/Auth");

authRouter.post("/signup",async (req,res)=>{
    try{
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

        //after signup , doing login
        const token = await user.getJWT();
        res.cookie("token",token , {
            expires : new Date(Date.now() + 7*3600000)
        });
        res.send(user);
    }
    catch(err){
        res.status(400).send("Error : "+ err.message)
    }
})

authRouter.post("/login",async(req, res)=>{
    try{
        
        const { emailId, password } = req.body;
        
        const user = await UserModel.findOne({ emailId : emailId }).select("+password");

        if(!user){
            throw new Error(" Invalid credentials ")
        }

        const isPasswordCorrect = await user.validatePassword(password)

        if(isPasswordCorrect){
            //creating a jwt token 
            const token = await user.getJWT();
            res.cookie("token",token , {
                expires : new Date(Date.now() + 7*3600000)
            });

            res.send(user);
        }else{
            throw new Error(" Invaid Credentials ");
        }
    }
    catch(err){
        res.status(400).send("Error : " + err.message);
    }
})

authRouter.post("/logout",(req,res)=>{
    try{
        res.cookie("token",null,{expires:new Date(Date.now())});
        res.send("Logout SucessFully");
    }
    catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
})

module.exports = authRouter;