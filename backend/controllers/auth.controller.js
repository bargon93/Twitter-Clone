import bcrypt from 'bcryptjs';
import User from "../models/user.model.js";
import tokenSetUp from "../utils/tokenSetUp.js"

export const signup = async (req, res) => {
    try {
        const {fullName, username, email, password} = req.body;
        
        const existingUser = await User.findOne({username : username});
        if(existingUser) {
            return res.status(400).json({error: "Username is already taken"});
        }

        const existingEmail = await User.findOne({email : email});
        if(existingEmail) {
            return res.status(400).json({error: "Email is already taken"});
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullname: fullName,
            username: username,
            email: email,
            password: hashedPassword
        })

        if(newUser) {
            tokenSetUp(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullname,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            })
        } else {
            res.status(400).json({error: "Invalid user data"});
        }

    } catch (error) {
        res.staus(500).json({error: error.message});
    }
}

export const login = async (req, res) => {
    res.json({
        data: "login"
    });
}

export const logout = async (req, res) => {
    res.json({
        data: "logout"
    });
}