//getVideoComments
//addComment
//updateComment
//deleteComment


import mongoose from "mongoose";
import { Comment } from "../models/commet_model.js";
import { ApiError } from "../utils/api_error.js";
import { Video } from "../models/video_model.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from '../utils/async_handler.js'

const addComment = asyncHandler(async(req,res) => {
    const {videoId,content} = req.body;
    if(!content) {
        throw new ApiError(400,'Comment is required')
    }
    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400,'Video Id not valid')
    }
    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(400,'Video unavailable')
    }

    const comment = await Comment.create({
        content,
        video:videoId,
        owner:req.user?._id
    });
    if(!comment) {
        throw new ApiError(400,'Comment not sent')
    }
    return res.status(200).json(
        new ApiResponse(200,comment,'Comment added')
    )
})

const getComment = asyncHandler(async(req,res) => {
    const {videoId} = req.params;
    console.log('videoId = ',videoId)
    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400,'Video Id not valid')
    }
    const comments = await Comment.find({video:videoId})
    if(!comments) {
        throw new ApiError(400,'No Comments')
    }
    return res.status(200).json(
        new ApiResponse(200,comments,'All Comments')
    )
})

const updateComment = asyncHandler(async(req,res) => {
    const {commentId,content} = req.body;
    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400,'Comment not found')
    }
    const comment = await Comment.findById(commentId);
    if(req.user._id.toString() !== comment.owner.toString()) {
        throw new ApiError(400,'Is not your comment')
    }
    const comments = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    );
    if(!comments) {
        throw new ApiError(400,'No Comments')
    }
    return res.status(200).json(
        new ApiResponse(200,comments,'Comment updated')
    )
})

const deleteComment = asyncHandler(async(req,res) => {
    const {videoId,commentId} = req.body;
    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400,'Video Id not valid')
    }
    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400,'Comment not found')
    }

    const comment = await Comment.findById(commentId);
    if(!commentId) {
        throw new ApiError(400,'Comment not found')
    }
    if(!req.user?._id.toString() !== comment.owner.toString()) {
        throw new ApiError(400,'Is not your comment')
    }
    const deletedComment = await Comment.deleteOne({_id:commentId});
    
    return res.status(200).json(
        new ApiResponse(200,deletedComment,'Comment deleted')
    )
})

export {
    addComment,
    getComment,
    updateComment,
    deleteComment
}