import bcrypt from 'bcryptjs';
import User from "../models/user.model.js";
import {tokenSetUp} from "../utils/tokenSetUp.js"

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

        if(password.length < 6) {
            return res.status(400).json({error: "Password must be at least 6 characters long"})
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
        res.status(500).json({error: error.message});
    }
}

export const login = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username: username});
        if(!user) {
            return res.status(400).json({error: `User ${username} is not registered`});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect) {
            return res.status(400).json({error: "Wrong password"});
        }

        tokenSetUp(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullname,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });

    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('jwt');
        res.status(200).json({message: "LogedOut"})
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}