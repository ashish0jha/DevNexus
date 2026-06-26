const jwt = require("jsonwebtoken");
const {UserModel} = require("../models/User");

const userAuth = async (req,res,next)=>{
    try{
        const {token} = req.cookies;
        if(!token) {
            return res.status(401).send(" login First ")
        }

        const {_id} = await jwt.verify(token, process.env.JWT_SECRET_KEY);

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