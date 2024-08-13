import jwt from 'jsonwebtoken';

export const tokenSetUp = (userID, res) => {
    const token = jwt.sign({userID}, process.env.JWT_SECRET,{
        expiresIn: '1d'
    })

    res.cookie("jwt", token, {
        maxAge: 24 * 60 * 60 * 1000, //MS
        httpOnly: true, //prevent scripting attacks
        sameSite: "strict", //prevent cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development",
    });
}