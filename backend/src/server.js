import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import MessageRoutes from './routes/message.route.js';
import Path from 'path';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();
const __dirname = Path.resolve();

const PORT =ENV.PORT  || 3000;

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", MessageRoutes);



//  make ready to deploy
if (ENV.NODE_ENV === "production") {
    app.use(express.static(Path.join(__dirname, "../frontend/dist")));

    app.get("*",(req,res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    })

}   

app.listen(PORT, () => { 
    
    console.log('Server is running on port '+PORT)
    connectDB();

});