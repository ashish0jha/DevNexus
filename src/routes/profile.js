const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/Auth")
const { UserModel } = require("../models/User");
const { isValidEditData } = require("../utils/validate");
const bcrypt = require("bcrypt");
const upload = require("../middlewares/upload");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");


profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const { password, __v, ...newUser } = req.user.toObject();
        res.send(newUser);
    }
    catch (err) {
        res.status(400).send("Something is wrong" + err.message);
    }
})

profileRouter.patch("/profile/edit", userAuth, upload.single("image"), async (req, res) => {
    try {
        (isValidEditData(req))
        const user = req.user;
        const { firstName, lastName, age, gender, about, location, skills } = req.body;
        let photoUrl = null;
        if (req.body?.photoUrl) {
            photoUrl = req.body?.photoUrl;
        }
        if (req.file) {
            photoUrl = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { "folder": "DevTinder_Profile" },
                    (error, result) => (
                        error ? reject(error) : resolve(result.secure_url)
                    )
                )
                streamifier.createReadStream(req.file.buffer).pipe(stream)
            })
        }
        const newData = { firstName, lastName, age, gender, about, location, skills };
        newData.photoUrl = photoUrl;

        Object.keys(newData).forEach((key) => (user[key] = newData[key]));

        await user.save();

        res.json({message:"Edited Successfully"})

    }
    catch (err) {
        res.status(400).send("Error : " + err.message);
    }

})

profileRouter.post("/profile/password", userAuth, async (req, res) => {
    try {
        const oldPassword = req.body?.oldPassword;
        if (!oldPassword) {
            throw new Error("Enter Something First")
        }
        const user = await req.user;

        const isPassWordCorrect = await user.validatePassword(oldPassword);

        if (!isPassWordCorrect) {
            throw new Error("Your old Password is Wrong");
        }
        const newPassword = req.body?.newPassword;
        if (!newPassword) {
            throw new Error("Enter the new Password as well")
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.send("Password Updated");
    }
    catch (err) {
        res.status(400).send("ERROR : " + err.message)
    }
})

module.exports = profileRouter;