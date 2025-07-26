import mongoose from "mongoose";

const connectDB = (url) => {
    console.log("Connect to DB")
    return mongoose.connect(url)
};

export default connectDB