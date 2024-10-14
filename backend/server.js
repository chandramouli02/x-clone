import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";

import { connectMongoDB } from "./db/connectMongoDB.js";

const app = express();

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

app.use(express.json()); //middleware to parse data. while req & res.
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
//console.log(process.env.MONGO_URI)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("server running at port:" + PORT);
  connectMongoDB();
});
