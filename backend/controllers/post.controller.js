import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body;
    let { img } = req.body;

    const uesr = await User.findById(userId);

    if (!uesr) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!img && !text) {
      return res.status(400).json({ message: "Post must have image or text" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost controller:", error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You're not authorized to delete this post" });
    }

    if (post.img) {
      const imgId = img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted Successfully." });
  } catch (error) {
    console.log("Error in deletePost controller: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ Error: "Text filed must not be Empty." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ Error: "Post not found" });
    }

    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();

    res.status(200).json(comment);
  } catch (error) {
    console.log("Error in commentOnPost controller", error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ Error: "Post not found" });
    }

    const isLikedPost = post.likes.includes(userId);

    if (isLikedPost) {
      //unlike a post..
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({_id: req.user._id}, {$pull: { likedPosts: postId}})
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      //like a post..
      post.likes.push(userId);
      await User.updateOne({_id: req.user._id}, {$push: { likedPosts: postId}})
      await post.save();

      //send liked post notification..
      const newNotification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });

      await newNotification.save();

      res.status(201).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    console.log("Error in LikeUnklikePost Controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    //gives latest posts at top.
    // populate gives the data of the user who posted the post.. *{this user is a field (id) in post..}
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json([]); //sends empty array if no posts are available..
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts Controller:", error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const getLikedPosts = async (req,res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if(!user){
      return res.status(400).json({Error: "User not found"});
    }

    const postsLikedByUser = await Post.find({_id: {$in: user.likedPosts}})
    .populate({
      path: "user",
      select: '-password',
    })
    .populate({
      path: 'comments.user',
      select: '-password',
    });
    //user.likedPosts array consists of postIds liked by that user.

    res.status(200).json(postsLikedByUser);   
  } catch (error) {
    console.log("Error in getLikedPosts controller:", error.message);
    res.status(500).json({Error: "Internal server Error"});
  }
}

export const getFollowingPosts = async(req,res)=> {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if(!user) return res.status(400).json({error: "user not found"});

    const followingUsers = user.following;
    if(!followingUsers){
      res.status(200).status({message: "User not following anyone."})
    }

    const feedPosts = await Post.find({user: {$in: followingUsers}}).sort({createdAt: -1})
    .populate({
      path: "user",
      select: '-password',
    })
    .populate({
      path: "comments.user",
      select: "-password"
    });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts Controller:", error.message);
    res.status(500).json({error: "Internal server error"});
  }
}

export const getUserPosts = async(req,res) => {
  try {
    const {username}  = req.params;

    const user = await User.findOne({username});
    if(!user) return res.status(400).json({error: "User not found"});

    const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
      path: 'user',
      select: '-password',
    })
    .populate({
      path: 'comments.user',
      select: '-password'
    })

    res.status(200).json(posts);

  } catch (error) {
    console.log("Error in getUserPosts controller: ", error.message);
    res.status(500).json({error: "Internal server error"})
  }
}