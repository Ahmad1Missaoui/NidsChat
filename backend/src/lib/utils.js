import jwt from "jsonwebtoken";


export const generateToken = (UserId,res) => {
  const {JWT_SECRET} = process.env;
  if(!JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  const token = jwt.sign({UserId}, JWT_SECRET,{
     expiresIn:"7d",
    });

    res.cookie("token",token,{
        maxAge:7*24*60*60*1000, // 7 days
        httpOnly:true,
        secure:process.env.NODE_ENV === "production" ? true : false,
        sameSite:"strict",

  });
}