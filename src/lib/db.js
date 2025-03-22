import mongoose from "mongoose";

const connectDB = async()=>{
    const mongoDb = process.env.MONGO_URI
    try {
        await mongoose.connect(mongoDb)
        console.log(`Data Base connected successfully.`)
    } catch (error) {
        console.log(error)
    }
}

export default connectDB;