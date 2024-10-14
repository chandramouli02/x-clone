import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import { connectMongoDB } from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
const app = express();

dotenv.config();
app.use(express.json());//middleware to parse data. while req & res.
app.use(express.urlencoded({extended: true}))
app.use(cookieParser());
//routes
app.use("/api/auth", authRoutes);
//console.log(process.env.MONGO_URI)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("server running at port:" + PORT);
  connectMongoDB();
});
