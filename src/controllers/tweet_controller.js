//createTweet
//getUserTweets
//updateTweet
//deleteTweet

import mongoose from "mongoose";
import { Tweet } from "../models/tweet_model.js";
import { ApiError } from "../utils/api_error.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/async_handler.js";

const createTweet = asyncHandler(async (req,res) => {
    const {content} = req.body;
    if(!content) {
        throw new ApiError(400,'Content is required')
    } 
    const tweet = await Tweet.create({
        content,
        owner:req.user?._id
    })

    return res.status(200).json(
        new ApiResponse(200,tweet,'tweet created successfully')
    )
})

const getUserTweet = asyncHandler(async (req,res) => {
    const {userId} = req.body;
    const tweets = await Tweet.find({owner:userId})
    return res.status(200).json(
        new ApiResponse(200,tweets,'Tweets fetched successfully')
    )
})

const updateTweet = asyncHandler(async (req,res) => {
    const {tweetId,content} = req.body;
    if(!content) {
        throw new ApiError(400,'Content is required')
    } 
    if(!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400,'Id not valid')
    } 
    console.log('tweetId : ',tweetId)
    const tweet = await Tweet.findById(tweetId);
    console.log('tweet : ',tweet)
    if(!tweet) {
        throw new ApiError(400,'Tweet not founds')
    }
    if(req.user?._id.toString() !== tweet.owner.toString()) {
        throw new ApiError(400,'This is not your tweet')
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content:content || tweet.content
        },
    },{
        new:true
    })
    return res.status(200).json(
        new ApiResponse(200,updatedTweet,'Tweets updated successfully')
    )
})

const deleteTweet = asyncHandler(async (req,res) => {
    const {tweetId} = req.body;
    if(!tweetId) {
        throw new ApiError(400,'Id is required')
    }
     if(!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400,'Id not valid')
    } 
    
    const tweet = await Tweet.findById(tweetId);

    if(!tweet) {
        throw new ApiError(400,'Tweet not founds')
    }
    if(req.user?._id.toString() !== tweet.owner.toString()) {
        throw new ApiError(400,'This is not your tweet')
    }

    const deletedTweet = await Tweet.deleteOne({_id:tweetId})

    return res.status(200).json(
        new ApiResponse(200,deletedTweet,'Tweets deleted successfully')
    )
})

export {
    createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet
}