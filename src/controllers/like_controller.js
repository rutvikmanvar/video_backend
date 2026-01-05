//toggleVideoLike
//toggleCommentLike
//toggleTweetLike
//getLikedVideo

import mongoose from "mongoose";
import { Like } from "../models/like_model.js"
import { asyncHandler } from "../utils/async_handler.js"
import { ApiError } from "../utils/api_error.js";
import {ApiResponse} from '../utils/api_response.js'

const toggleVideoLike = asyncHandler(async(req,res) => {
    const {videoId} = req.body;
    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400,'Id not valid')
    }
    const existingLike = await Like.findOne({
        video:videoId,
        likeBy:req.user?._id
    })
    console.log('existingLike : ',existingLike)
    if(existingLike) {
        await Like.deleteOne({_id:existingLike._id})
        return res.status(200).json(
            new ApiResponse(200,null,'Video Dislike')
        )
    } else {
        const like = await Like.create({
            video:videoId,
            likeBy:req.user._id
        })
        return res.status(200).json(
            new ApiResponse(200,like,'Video Like')
        )
    }
})

const toggleComentLike = asyncHandler(async(req,res) => {
    const {commentId} = req.body;
    console.log('commentId : ',commentId)
    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400,'Id not valid')
    }
    const existingLike = await Like.findOne({
        comment:commentId,
        likeBy:req.user?._id
    })
    console.log('existingLike : ',existingLike)
    if(existingLike) {
        await Like.deleteOne({_id:existingLike?._id});
        return res.status(200).json(
            new ApiResponse(200,null,'Comment Dislike')
        );
    } else {
        const like = await Like.create({
            comment:commentId,
            likeBy:req.user?._id
        })
        return res.status(200).json(
            new ApiResponse(200,like,'Comment Like')
        )
    }
})

const toggleTweetLike = asyncHandler(async(req,res) => {
   const {tweetId} = req.body;
    if(!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400,'Id not valid')
    }
    const existingLike = await Like.findOne({
        comment:tweetId,
        likeBy:req.user?._id
    })
    if(existingLike) {
        await Like.deleteOne({_id:existingLike?._id});
        return res.status(200).json(
            new ApiResponse(200,'Tweet Dislike')
        )
    } else {
        const like = await Like.create({
            tweet:tweetId,
            likeBy:req.user?._id
        })

        return res.status(200).json(
            new ApiResponse(200,like,'Tweet Like')
        )
    } 
})

const getLikedVideo = asyncHandler(async(req,res) => {
    const likedVideos = await Like.aggregate([
        {
            $match:{
                likeBy:req.user?._id,
                video:{
                    $exists:true,
                    $ne:null
                }
            }
        },
        {
            $lookup:{
                from:'videos',
                localField:'video',
                foreignField:'_id',
                as:'videoDetails'
            }
        },
        {
            $unwind:'$videoDetails'
        },
        {
            $group:{
                _id:'$likeBy',
                videos:{$push:"$videoDetails"}
            }
        },
        
    ])

    const result = likedVideos.length > 0 
        ? likedVideos[0] 
        : { videos: [] };

    console.log('liked video : ',result)
    return res.status(200).json(
        new ApiResponse(200,result,'Video fetched')
    )
})

export {
    toggleVideoLike,
    toggleComentLike,
    toggleTweetLike,
    getLikedVideo
}