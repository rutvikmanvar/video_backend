import mongoose from "mongoose";
import { asyncHandler } from "../utils/async_handler.js"
import { ApiError } from "../utils/api_error.js";
import { Subscription } from "../models/subscription_model.js";
import { ApiResponse } from "../utils/api_response.js";

const toggleFollow = asyncHandler(async(req,res) => {
    const {userId} = req.body;
    if(!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400,'User not found')
    }
    if(req.user?._id.toString() === userId.toString()) {
        throw new ApiError(400,'You not able to follow your self')
    }
    const follow = await Subscription.findOne({
        subscribe:req.user?._id,
        channel:userId
    });
    if(follow) {
        await Subscription.deleteOne({
            _id:follow._id
        });
        return res.status(200).json(
            new ApiResponse(200,null,'Unfollow Successfully')
        )
    }
    else{
        const followToUser = await Subscription.create({
            subscribe:req.user?._id,
            channel:userId
        })
        return res.status(200).json(
            new ApiResponse(200,followToUser,'Follow Successfully')
        )
    }
})

const getFollowing = asyncHandler(async(req,res) => {
    
    const {userId} = req.body;
    if(!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400,'User not exist')   
    }
    const following = await Subscription.countDocuments({
        subscribe:userId
    });
    console.log('following : ',following)
    
    return res.status(200).json(
        new ApiResponse(200,following,'following count')
    )
})

const getFollowers = asyncHandler(async(req,res) => {
    const {userId} = req.body;
    if(!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400,'User not exist')   
    }
    const followers = await Subscription.countDocuments({
        channel:userId
    });
    console.log('followers : ',followers)
    return res.status(200).json(
       new ApiResponse(200,followers,'followers count')
    );
})

const getFollowingDetails = asyncHandler(async(req,res) => {
    const {userId} = req.body;
    if(!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400,'User not exist')   
    }
    const following = await Subscription.find({
        subscribe:userId
    });
    console.log('following : ',following)
    
    return res.status(200).json(
        new ApiResponse(200,following,'following count')
    )
})

const getFollowersDetails = asyncHandler(async(req,res) => {
    
})

export {
    toggleFollow,
    getFollowing,
    getFollowers,
    getFollowingDetails,
    getFollowersDetails
}