import jwt from 'jsonwebtoken';

export const tokenSetUp = (userID, res) => {
    const token = jwt.sign({userID}, process.env.JWT_SECRET,{
        expiresIn: '1d'
    })
}