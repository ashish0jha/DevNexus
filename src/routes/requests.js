const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/Auth")
const conncetionRequestSchema = require("../models/connectionRequest")
const {UserModel} = require("../models/User")

const SAFE_USER_DATA = "firstName lastName age gender photoUrl skills about";

requestRouter.post("/request/send/:status/:receiverId", userAuth ,async(req,res)=>{
    try{
        const senderId=req.user._id;
        const receiverId = req.params.receiverId;
        const status = req.params.status;

        const ALLOWED_STATUS = ["Interested","Ignored"];
        if(!ALLOWED_STATUS.includes(status)){
            throw new Error("Invalid status of request");
        }

        const receiver = await UserModel.findById(receiverId);

        if(!receiver){
            res.status(404).send("User not found");
        }
        
        if(req.user._id.equals(receiver._id)){
            throw new Error("User Can't request to itsellf");
        }

        const isCrossConnection = await conncetionRequestSchema.findOne({
            $or:[
                {senderId,receiverId},
                {senderId : receiverId, receiverId:senderId}
            ]
        })
        if(isCrossConnection){
            throw new Error("Request already Exist");
        }

        const newRequest =await new conncetionRequestSchema({
            senderId,
            receiverId,
            status,
        })

        await newRequest.save();

        res.send(`${req.user.firstName} sends request to ${receiver.firstName}`)

    }catch(err){
        res.status(400).send("Error : "+ err.message)
    }
})

requestRouter.post("/request/review/:status/:requestId",userAuth,async (req,res)=>{
    try{
        const loggedUser = req.user;
        const {status , requestId} = req.params;

        const allowedStatus = ["Accepted","Rejected"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                message:"Invalid request Status"
            })
        }

        const request = await conncetionRequestSchema.findOne({
            _id:requestId,
            receiverId:loggedUser._id,
            status:"Interested",
        }).populate("senderId",SAFE_USER_DATA);
        if(!request){
            return res.status(404).json({
                message:"Request not found",
            })
        }
        
        request.status = status;
        await request.save();

        res.json({
            message:`${loggedUser.firstName} ${status} requests of ${(await UserModel.findById(request.senderId)).firstName}`,
            data:request,
        })
    }
    catch(err) {
        res.status(400).send("Error : " + err.message)
    }
})

requestRouter.delete("/request/cancel/:_id",userAuth,async (req,res)=>{
    try{
        await conncetionRequestSchema.findOneAndDelete({senderId:req.user._id,receiverId:req.params._id});
        res.send("Request Deleted Successfully");

    }
    catch(err){
        res.status(400).removeListener.send("ERROR : "+ err.message);
    }
})

module.exports = requestRouter;