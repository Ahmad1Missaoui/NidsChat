import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
    try{
       const {MONGO_URI} = ENV;
       
       if(!MONGO_URI){
        console.error("❌ MONGO_URI is missing!");
        console.error("Available env vars:", Object.keys(process.env).filter(k => !k.startsWith('npm_')));
        throw new Error("MONGO_URI is not defined in environment variables");
       }  

       console.log("🔗 Connecting to MongoDB...");
       const conn = await mongoose.connect(MONGO_URI);
       console.log("✅ MongoDB connected successfully:", conn.connection.host);
    }catch(error){
        console.error("❌ MongoDB connection error:", error.message);
        process.exit(1);
    }
}

