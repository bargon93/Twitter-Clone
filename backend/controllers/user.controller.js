import bcrypt from 'bcryptjs';
import {v2 as cloudinary} from 'cloudinary';
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";


export const getUserProfile = async (req, res) => {
    const {username} = req.params;

    try {
        const user = await User.findOne({username: username}).select("-password");
        if (!user) return res.status(404).json({error: "User not found"});
        res.status(200).json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const followOrUnfollowUser = async (req, res) => {
    const { id } = req.params;
    try {
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id === req.user._id.toString()) return res.status(400).json({error: "You can't follow or unfollow yourself"});
        if(!userToModify || !currentUser) return res.status(404).json({error: "User not found"});

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            //unfollow user
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}});
            res.status(200).json({message: "User unfollowd successfully"});
        } else {
            //follow user
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}});
            //send notification
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });
            
            await newNotification.save();

            res.status(200).json({message: "User followed successfully"})
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userID = req.user._id;
        const usersFollowed = await User.findById(userID).select("following");
        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne:userID}
                }           
            },
            {$sample: {size:10}}
        ])

        const filteredUsers = users.filter(user => !usersFollowed.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach(user=>user.password=null);
        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const updateUser = async (req, res) => {
    const {fullname, email, username, currentPassword, newPassword, bio, link} = req.body;
    let {profileImg, coverImg} = req.body;
    const userID = req.user._id;

    try {
        let user = await User.findById(userID);
        if(!user) return res.status(404).json({message: "User not found"});

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({error: "Missing data for updating password"});
        }

        if(currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch) return res.status(400).json({error: "Incorrect password"});
            if(newPassword.length < 6) return res.status(400).json({error: "Password must be at least 5 characters long"});
            
            user.password = await bcrypt.hash(newPassword, 10);
        }

        if(profileImg) {
            if(user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploaded = await cloudinary.uploader.upload(profileImg);
            profileImg = uploaded.secure_url;
        }

        if(coverImg) {
            if(user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploaded = await cloudinary.uploader.upload(coverImg);
            coverImg = uploaded.secure_url;
        }

        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        user.password = null;

        return res.status(200).json(user);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}