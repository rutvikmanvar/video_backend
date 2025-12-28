import { User } from "../models/user_model_temp.js";
import { ApiError } from "../utils/api_error.js";
import { asyncHandler } from "../utils/async_handler.js";
import jwt from 'jsonwebtoken';

const verifyJWT = asyncHandler(async(req,res,next) => {
    try {
        const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token) {
            throw new ApiError(401,'Unauthorized')
        }
    
        const reqUser = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(reqUser?._id).select("-password -refreshToken")
    
        if(!user) {
            throw new ApiError(401,'Invalid Access Token')
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || 'Invalid access token')
    }
})

export {verifyJWT}