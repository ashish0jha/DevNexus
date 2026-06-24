const express = require("express");
const paymentRouter = express.Router();
const { userAuth } = require("../middlewares/Auth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment")

paymentRouter.post("/payment/order",userAuth,async(req,res)=>{
    try{
        const {firstName,lastName,emailId} = req.user;
        const {memberShipType} = req.body;

        const order =await razorpayInstance.orders.create({
            amount: (memberShipType==="Gold" ? 50000 : 30000 ),
            currency: "INR",
            receipt: "order_rcptid_11",
            notes:{
                firstName,
                lastName,
                emailId,
                memberShipType
            }
        })
        const {id,status,amount,currency,receipt,notes} = order;
        const payment = new Payment({
            userId:req.user._id,
            orderId:id,
            status,
            amount,
            currency,
            receipt,
            notes
        })

        const savedPayment = await payment.save();
        
        res.json({ ...savedPayment.toJSON(),keyId:process.env.RZP_API_KEY })
    }
    catch (err) {
        res.status(400).send("ERROR : " + err.message)
    }
})

module.exports = paymentRouter;