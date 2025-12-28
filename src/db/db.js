import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try {
        console.log(`uri : ${process.env.MONGODB_URI}`)
        const mongodbInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MONGODB Connected on ${mongodbInstance.connection.host}`);
    } catch (error) {
        console.log('Error : ',error)
        process.exit(1)
    }
}

export default connectDB;