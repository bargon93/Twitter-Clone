import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userID = req.user._id;
        const notifications = await Notification.find({to: userID})
        .populate({
            path: "from",
            select: "username profileImg",
        })

        await Notification.updateMany({to: userID}, {read: true});

        res.status(200).json(notifications);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userID = req.user._id;
        await Notification.deleteMany({to: userID});

        res.status(200).json({message: "Notifications deleted successfully"});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal server error"});
    }
}