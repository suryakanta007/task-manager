import jwt from "jsonwebtoken"
import {ApiError} from "../utils/api-error.js"
import { User } from "../models/user.model.js";
import { errorMonitor } from "events";


export const isAuth = async (req,res,next)=>{
    const {accessToken} = req.cookies;
    if(!accessToken){
       next(new ApiError(400,"AccessToken is expiryed"));
    }
    
   try {
     const decoded = await jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
     const user = await User.findById(decoded._id).select("-password -refreshToken");
    
     if(!user){
        return res.status(402).json(new ApiError(402,"User not found , unauthorized."))
     }
     
     req.user = user
     
     next()
   } catch (error) {
        console.log((new ApiError(401,"Invalid token or expired.")), "\nerror :" ,error);
        return next(new ApiError(401,"Invalid token or expired."))
   }

}

