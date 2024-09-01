import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from 'cloudinary';

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        });
        if(posts.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getFollowingPosts = async(req, res) => {
    try {
        const userID = req.user._id;
        const user = await User.findById(userID);
        if(!user) return res.status(404).json({error: "User not found"});

        const following = user.following;

        const feedPosts = await Post.find({user: {$in: following}})
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });

        res.status(200).json(feedPosts);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getAllLikedPosts = async (req, res) => {
    try {
        const userID = req.params.id;

        const user = await User.findById(userID);
        if(!user) return res.status(404).json({error: "User not found"});

        const likedPosts = await Post.find({_id: {$in: user.likedPosts}})
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username});
        if(!user) return res.status(404).json({error: "User not found"});

        const posts = await Post.find({user: user._id}).sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });

        res.status(200).json(posts);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const createPost = async (req, res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userID = req.user._id.toString();

        if(!img && !text) return res.status(400).json({error: "Nothing to post"});

        const user = await User.findById(userID);
        if(!user) return res.status(404).json({error: "User not found"});

        if(img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user: userID,
            text: text,
            img: img,
        });

        await newPost.save();

        res.status(201).json(newPost);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({error: "Post not found"});

        if(post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({error: "Can not delete other users' posts"});
        }

        if(post.img) {
            const imgID = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgID);
        }
        
        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({message : "Post deleted successfully"});

    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const {text} = req.body;
        const postID = req.params.id;
        const userID = req.user._id;

        if(!text) return res.status(400).json({error: "Nothing to comment"});

        const post = await Post.findById(postID);

        if(!post) return res.status(404).json({error: "Post not found"});

        const newComment = {user: userID, text};
        post.comments.push(newComment);
        await post.save();

        res.status(200).json(post.comments);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userID = req.user._id;
        const {id:postID} = req.params;

        const post = await Post.findById(postID);
        if(!post) return res.status(404).json({error: "Post not found"});

        const userLikedPost = post.likes.includes(userID);

        if(userLikedPost) {
            //unlike post
            await Post.updateOne({_id: postID}, {$pull: {likes: userID}});
            await User.updateOne({ _id: userID}, {$pull: {likedPosts: postID}});
            const updatedLikes = post.likes.filter((id) => {id.toString() !== userID.toString()});
            res.status(200).json(updatedLikes);
        } else {
            //like post
            post.likes.push(userID);
            await post.save();
            await User.updateOne({ _id: userID}, {$push: {likedPosts: postID}});
            const notification = new Notification({
                from: userID,
                to: post.user,
                type:"like",
            });

            await notification.save();

            res.status(200).json(post.likes);
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}