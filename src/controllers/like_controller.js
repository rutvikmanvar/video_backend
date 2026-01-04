//toggleVideoLike
//toggleCommentLike
//toggleTweetLike
//getLikedVideo

import mongoose from "mongoose";
import { Like } from "../models/like_model.js"
import { asyncHandler } from "../utils/async_handler.js"
import { ApiError } from "../utils/api_error";

const toggleVideoLike = asyncHandler(async(req,res) => {
    const {videoId} = req.body;
    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400,'Id not valid')
    }
    const existingLike = await Like.findOne({
        video:videoId,
        likeBy:req.user?._id
    })
    if(existingLike) {
        await Like.deleteOne({_id:existingLike._id})
        return res.status(200).json(
            new ApiResponse(200,null,'Dislike')
        )
    } else {
        await Like.create({
            video:videoId,
            likeBy:req.user._id
        })
    }
})

const toggleComentLike = asyncHandler(async(req,res) => {
    
})

const toggleTweetLike = asyncHandler(async(req,res) => {
    
})

const getLikedVideo = asyncHandler(async(req,res) => {
    
})

export {
    toggleVideoLike,
    toggleComentLike,
    toggleTweetLike,
    getLikedVideo
}