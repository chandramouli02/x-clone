import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  try {
    const { username, fullName, password, email } = req.body;

    if(!username || !fullName || !password || !email) return res.status(400).json({error: "Enter all the fields."})

    const emailRegx = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    if (!emailRegx.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    
    if(!fullName){
      fullName = username;
    }
    
    if (password.length < 6) {
      return res
      .status(400)
      .json({ error: "Password length must be greater than 6" });
    }
    
    //hash password using bcrypt.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);//In this res we set cookie.
      await newUser.save(); //saves new user to db.

      newUser.password = null;
      res.status(201).json(newUser
      //   {
      //   _id: newUser._id,
      //   username: newUser.username,
      //   email: newUser.email,
      //   fullName: newUser.fullName,
      //   followers: newUser.followers,
      //   following: newUser.following,
      //   coverImg: newUser.coverImg,
      //   profileImg: newUser.profileImg,
      // }
    );
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("error in signup controller:", error.message); //for debugging porpuse.
    res.status(500).json({ error: "Internal server Error." });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password){
      return res.status(400).json({error: "Enter both username and password"})
    }

    const user = await User.findOne({ username });
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordValid) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res); // creates cookies and sends as response..
    
    user.password = null;
    res.status(200).json(user
    //   {
    //   _id: user._id,
    //   username: user.username,
    //   email: user.email,
    //   fullName: user.fullName,
    //   followers: user.followers,
    //   following: user.following,
    //   coverImg: user.coverImg,
    //   profileImg: user.profileImg,
    // }
  );

  } catch (error) {
    console.log("error in login controller:", error.message); //for debugging porpuse.
    res.status(500).json({ error: "Internal server Error." });
  }
};

export const logout = async(req, res) => {
  try {
    res.cookie('jwt','', {maxAge:0}); // clears the jwt in browser.
    res.status(200).json({message: "Logged out successfully"})
  } catch (error) {
    console.log('error in logout controller:', error.message);
    res.status(500).json({error: "Internal server error"})
  }
};

export const getMe = async(req,res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    console.log('error in getMe controller', error.message);
    res.status(500).json({error: "Internal server error"})
  }
}