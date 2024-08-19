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