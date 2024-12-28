import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log("connected to mongo. Host: ",connectionInstance.connection.host);
        

    } catch (error) {
        console.log("Error in database connection")
        console.error(error)
    }

} 

export default connectDB