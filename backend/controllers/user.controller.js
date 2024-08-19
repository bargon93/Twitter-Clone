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