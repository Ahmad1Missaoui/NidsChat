import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const ArcjetProtection = async (req, res, next) => {
try{
    const decision = await aj.protect(req);

    if(decision.isDenied()){
        if(decision.reason.isRateLimit()){
            return res.status(429).json({message:"Too many requests, please try again later."});
        }
    else if(desision.reason.isBot()){
        return res.status(403).json({message:"Access denied for bots."});   

    }else {
        return res.status(403).json({message:"Access denied by security policy."});
    }} 


    if(decision.result.some(isSpoofedBot)){
         return res.status(403).json({
         error:"Spoofed bot detected ",
         message:"malicious bot activity detected.",
         });


    }
    next();
}catch(error){
    console.log(" Arcjet protection  error:",error);
    next();

}
}