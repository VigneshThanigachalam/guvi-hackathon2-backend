import mongoose from "mongoose";

export const db_connect = () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URL);
        console.log("database connected successfully");
    } catch (err) {
        console.log(err);
    }
};