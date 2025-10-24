import dotenv from "dotenv";   
dotenv.config();
export const ENV = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    CLIENT_URL: process.env.CLIENT_URL,
     
// PORT=3000
// MONGO_URI=mongodb+srv://missaouiahmed404_db_users:7hz6cPlhhl8eBRFv@cluster0.cb6pwov.mongodb.net/Nids_db?retryWrites=true&w=majority&appName=Cluster0
// NODE_ENV=development


// JWT_SECRET=my_jwt_secret_key  

// RESEND_API_KEY=re_35t9XqHF_JjAEEoU6SyFym9yGJuB2ntCC

// EMAIL_FROM="onboarding@resend.dev"
// EMAIL_FROM_NAME="Nids Team"
// CLIENT_URL=http://localhost:5173



};