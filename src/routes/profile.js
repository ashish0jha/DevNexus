const express = require("express");
const profileRouter = express.Router();

const { userAuth } = require("../middlewares/Auth")
const { UserModel } = require("../models/User");
const { isValidEditData } = require("../utils/validate");
const bcrypt = require("bcrypt");


profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const { password, __v, ...newUser } = req.user.toObject();
        res.send(newUser);
    }
    catch (err) {
        res.status(400).send("Something is wrong" + err.message);
    }
})

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        (isValidEditData(req))
        
        const newData = req.body;
        const user = req.user;

        Object.keys(newData).forEach((key) => (user[key] = newData[key]));

        await user.save();

        res.send(user)

    }
    catch (err) {
        res.status(400).send("Error : " + err.message);
    }

})

profileRouter.post("/profile/password",userAuth,async(req,res)=>{
    try{
        const oldPassword = req.body?.oldPassword ;
        if(!oldPassword){
            throw new Error("Enter Something First")
        }
        const user = await req.user;

        const isPassWordCorrect = await user.validatePassword(oldPassword);

        if(!isPassWordCorrect){
            throw new Error("Your old Password is Wrong");
        }
        const newPassword = req.body?.newPassword;
        if(!newPassword){
            throw new Error("Enter the new Password as well")
        }
        user.password = await bcrypt.hash(newPassword,10);    
        await user.save();

        res.send("Password Updated");
    }
    catch(err){
        res.status(400).send("ERROR : " + err.message)
    }
})

module.exports = profileRouter;