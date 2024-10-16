import User from "../models/user.model.js";
import jwt from 'jsonwebtoken'

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // to get this we need to use cookie-parser
    
    if (!token) {
      return res
        .status(401)
        .json({ error: "unauthorized: no jwt token provided" });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET); 
    //verify method returns the payload{userId} after success.

    if (!decoded) {
      return res.status(401).json({ error: "unauthorized: Invalid token" });
    }

    const user = await User.findOne({_id : decoded.userId}).select("-password"); //doesn't send the password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    req.user = user;//assigning user details to req object.
    next();
  } catch (error) {
    console.log("error in protectRoute middleware:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
