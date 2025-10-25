import jwt  from "jsonwebtoken";
import  User  from "../models/User.js";
import { ENV } from "../lib/env.js";



export const ProtectRoute =async (req, res, next) => {
    try {
       const token = req.cookies.jwt;
         if(!token)return res.status(401).json({message:"Not authorized, no token"});  

       const decoded = jwt.verify(token, ENV.JWT_SECRET);
         if (!decoded) return res.status(401).json({message:"Not authorized, token failed"});
       
       const user = await User.findById(decoded.UserId).select("-password");
         if (!user) return res.status(404).json({message:"  Master we have a problem here, user not found"});
      

        req.user = user;
        next();

    }catch (error) {
        console.log("Hey men we have an error in ProtectRoute middleware ",error);
        res.status(500).json({message:"internal server error in auth middleware"});
    }




};


