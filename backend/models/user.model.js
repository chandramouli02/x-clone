import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    following: [{ type: mongoose.Schema.Types.ObjectId, //id of 16characters.
        ref: "User",
        default: [],
     }],
     followers: [{ type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
     }],
     profileImg: {
        type: String,
        default: '',
     },
     coverImg: {
        type:String,
        default: '',
     },
     bio: {
        type: String,
        default: '',
     },
     link: {
        type: String,
        default: '',
     },
     likedPosts: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Post",
         default: []
      }
     ]
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);//mongodb converts "User" as users.

export default User;