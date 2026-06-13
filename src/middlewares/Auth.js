const jwt = require("jsonwebtoken");
const {UserModel} = require("../models/User");

const userAuth = async (req,res,next)=>{
    try{
        const {token} = req.cookies;
        if(!token) {
            throw new Error("Invalid Token")
        }

        const {_id} = await jwt.verify(token,"nexa0781@_tm/tm*()");

        const user =await UserModel.findById(_id);
        if(!user){
            throw new Error("User does not exist");
        }
        req.user = user;
        next();
    }
    catch(err){
        res.status(401).send("ERROR : " + err.message);
    }
}

const adminAuth = (req,res,next)=>{
    const token = "xy";
    const isAdminAuthorized = token === "xyz";

    if(isAdminAuthorized){
        next();
    }else{
        res.status(401).send("Unauthorize Access");
    }
}

module.exports = { adminAuth , userAuth }