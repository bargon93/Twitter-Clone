import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import {v2 as cloudinary} from 'cloudinary';

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

        res.status(200).json(post);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}