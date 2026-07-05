const express = require("express");
const userRouter = express.Router();

const { UserModel } = require("../models/User");
const ConnectionRequestSchema = require("../models/connectionRequest");
const { userAuth } = require("../middlewares/Auth");

const SAFE_USER_DATA = "firstName lastName age gender photoUrl skills about location";

userRouter.get("/user/requests/:state", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const state = req.params.state;

        const allowedStates = ["sent", "received"];
        if (!allowedStates.includes(state)) {
            throw new Error("Entered State is wrong")
        }

        const requiredFeild = (state === "sent" ? "senderId" : "receiverId");

        const totalRequests = await ConnectionRequestSchema.find({
            [requiredFeild]: loggedInUser._id,
            status: "Interested",
        }).populate("senderId", SAFE_USER_DATA)
            .populate("receiverId", SAFE_USER_DATA);

        res.send(totalRequests);
    } catch (err) {
        res
            .status(400)
            .send("Something is wrong and that something is : " + err.message);
    }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const totalConnections = await ConnectionRequestSchema.find({
            $or: [
                { senderId: loggedInUser._id, status: "Accepted" },
                { receiverId: loggedInUser._id, status: "Accepted" }
            ]
        })
            .populate("senderId", SAFE_USER_DATA)
            .populate("receiverId", SAFE_USER_DATA);

        const data = totalConnections.map((row) => {
            if (loggedInUser._id.equals(row.senderId._id)) {
                return row.receiverId;
            }
            return row.senderId;
        })

        res.json({
            message: `You have total connection of ${data.length}`,
            data: data
        })
    } catch (err) {
        res.status(400).send("Error : the error is : " + err.message);
    }
})

userRouter.get("/user/feed", userAuth, async (req, res) => {
    try {

        const loggedInUser = req.user;

        const page = req.query.page || 1;
        let limit = req.query.limit || 12;
        const skip = (page - 1) * limit;

        limit = limit > 50 ? 50 : limit;

        const connectionRequests = await ConnectionRequestSchema.find({
            $or: [
                { senderId: loggedInUser._id },
                { receiverId: loggedInUser._id }
            ]
        }).select("senderId receiverId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach(val => {
            hideUsersFromFeed.add(val.senderId.toString());
            hideUsersFromFeed.add(val.receiverId.toString());
        });
        const users = await UserModel.aggregate([
        {
            $match: {
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed) } },
                { _id: { $ne: loggedInUser._id } }
            ]
            }
        },
        { $sample: { size: limit } },
        {
            $project: {
                firstName: 1,
                lastName: 1,
                photoUrl: 1,
                about: 1,
                skills: 1,
                age: 1,
                gender: 1,
                location:1,
            }
        }
        ]);
        users.sort(() => Math.random() - 0.5);
        res.send(users)

    } catch (err) {
        res.status(400).send("Something is wrong : " + err.message);
    }
});

userRouter.delete("/user/remove/:id", userAuth, async (req, res) => {
    try {
        const sender = req.user._id;
        const receiver = req.params.id;

        await ConnectionRequestSchema.findOneAndDelete({
            $or: [
                { senderId: sender, receiverId: receiver, status: "Accepted" },
                { senderId: receiver, receiverId: sender, status: "Accepted" }
            ]
        })
        res.send("Deleted sucessfully")
    }
    catch (err) {
        res.status(400).send("ERROR : " + err.message)
    }
})

userRouter.delete("/user", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        await UserModel.findByIdAndDelete(userId);

        res.send("user Deleted");
    } catch (err) {
        res.status(400).send("Something is Wrong");
    }
});

module.exports = userRouter;
