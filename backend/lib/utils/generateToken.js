import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookie = (userId,res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '15d'
    });//This userId we decode it in protectRoute to verify the user for any requests..

    res.cookie('jwt', token, {
        maxAge: 15*24*60*60*1000,//MS
        httpOnly: true,//prevents XSS attacks 
        sameSite: "strict",//prevents CRSF attacks
        secure: process.env.NODE_ENV !== 'development'//https
    })
}
