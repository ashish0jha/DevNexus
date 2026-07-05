const express = require("express");
const { userAuth } = require("../middlewares/Auth");
const { validPostUplaod } = require("../utils/validate");
const postRouter = express.Router();
const upload = require("../middlewares/upload");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");
const Post = require("../models/post")

postRouter.post("/post/create", userAuth, upload.single("image"), async (req, res) => {
    try {
        const { content } = req.body;
        let imageUrl = null;
        if (req.body?.imageUrl) {
            imageUrl = req.body?.imageUrl;
        }
        if (req.file && !imageUrl) {
            imageUrl = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "devTinder_Posts" },
                    (error, result) => {
                        return error ? reject(error) : resolve(result.secure_url);
                    }
                )
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            })
        }
        const post = new Post({
            userId: req.user._id,
            content
        })
        if (imageUrl) {
            post.imageUrl = imageUrl;
        }
        const savedPost = await post.save();
        res.json({ data: savedPost });
    }
    catch (err) {
        res.json({ message: err.message })
    }
})

postRouter.get("/post/feed", userAuth, async (req, res) => {
    try {
        const { _id } = req.user;
        const posts = await Post.find({
            $nor: [{ userId: _id }]
        }).populate("userId", "firstName lastName photoUrl")
            .populate('comments.userId', "firstName lastname photoUrl")
            .sort(() => Math.random() - 0.5);

        if (!posts) {
            throw new Error("There is no posts left");
        };

        const postsWithLikeInfo = posts.map((post) => ({
            ...post.toObject(),
            likesCount: post.likes.length,
            liked: post.likes.some((id) => id.equals(_id))
        }))
        res.json({ posts: postsWithLikeInfo });
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
})

postRouter.get("/post/user", userAuth, async (req, res) => {
    try {
        const { _id } = req.user;
        const posts = await Post.find({ userId: _id });
        res.json({ posts });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
})

postRouter.get("/getcomment/:postId", userAuth, async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById({ _id: postId }).populate('comments.userId', "firstName lastname photoUrl");
        if (!post) {
            throw new Error("Post does not exist");
        }

        res.json({ data: post.comments });
    }
    catch (err) {
        res.json({ message: err.message })
    }
})

postRouter.post("/post/comment/:postId", userAuth, async (req, res) => {
    try {
        const { _id } = req.user;
        const { postId } = req.params;
        const { text } = req.body;

        const post = await Post.findById({ _id: postId });
        if (!post) {
            throw new Error("Post doesn't exist");
        }
        const comments = post.comments;
        const isCommentExist = comments.filter((comment) => {
            return comment.text === text
        })
        if (isCommentExist.length > 0) {
            throw new Error("Comment Already  exist");
        }
        post.comments.push({
            userId: _id,
            text
        })
        await post.save();
        res.json({ message: "comment posted" });
    }
    catch (err) {
        res.json({ message: err.message })
    }
})

postRouter.patch("/addLike/:postId", userAuth, async (req, res) => {
    try {
        const { postId } = req.params;
        let { _id } = req.user;
        let post = await Post.findById({ _id: postId });
        if (!post) {
            throw new Error("Post does not exist");
        }
        const alreadyLiked = post.likes.includes(_id);
        if (alreadyLiked) {
            [_id, ...newLikeArr] = post.likes;
            post.likes = newLikeArr;
        } else {
            post.likes.push(_id);
        }

        const savedPost = await post.save();
        res.json({
            data: {
                likesCount: post.likes.length,
                liked: !alreadyLiked
            }
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
})

module.exports = postRouter;