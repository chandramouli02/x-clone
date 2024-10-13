import mongoose from "mongoose";

export const connectMongoDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to mongoDB: ${conn.connection.host}`)
    } catch (error) {
        console.log(`error: ${error.message}`)
        process.exit(1); //exit code 1 means connection failure.
    }
}