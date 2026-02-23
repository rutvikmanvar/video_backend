//getAllVideos
//publishVideo
//getVideoById
//updateVideo (title,description,thumbnail)
//deleteVideo
//togglePublishStatus

import {Video} from '../models/video_model.js'
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_response.js';
import { asyncHandler } from '../utils/async_handler.js'
import { uploadOnCloudinary } from '../utils/clouldinary.js';

const publishVideo = (asyncHandler(async(req,res) => {

    const {title,description,isPublished} = req.body;

    if(!title) {
        throw new ApiError(400,'Title is required')
    }
    if(!description) {
        throw new ApiError(400,'Description is required')
    }

    const videoLocalPath = req.files?.video[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    console.log('videoLocalPath : ',videoLocalPath);
    console.log('thumbnailLocalPath : ',thumbnailLocalPath);

    if(!videoLocalPath) {
        throw new ApiError(400,'Video not found')
    }
    if(!thumbnailLocalPath) {
        throw new ApiError(400,'Thumbnail not found')
    }

    const cloudVideo = await uploadOnCloudinary(videoLocalPath);
    const cloudThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    console.log('cloud video url : ',cloudVideo.url)
    console.log('cloud thumbnail url : ',cloudThumbnail.url)


    if(!cloudVideo?.url) {
        throw new ApiError(400,'Failed to upload on cloudinary')
    }
    if(!cloudThumbnail?.url) {
        throw new ApiError(400,'Failed to upload on cloudinary')
    }

    const video = await Video.create({
        title,
        description,
        isPublished: isPublished || true,
        videoFile:cloudVideo?.url,
        thumbnail:cloudThumbnail?.url,
        duration:cloudVideo?.duration,
        owner:req.user._id
    });

    await video.save();

    return res.status(200).json(
        new ApiResponse(200,video,'Video published successfully')
    )

}))


const getAllVideo = asyncHandler(async(req,res) =>{

    const videos = await Video.find({isPublished:true});

    return res.status(200).json(
        new ApiResponse(200,videos,'Video fetched successfully')
    )
})

const getVideoById = asyncHandler(async(req,res) => {
    const id = req.params.id;

    if(!id) {
        throw new ApiError(400,'Not matched')
    }

    const video = await Video.findOne({_id:id,isPublished:true});

    if(!video) {
        throw new ApiError(400,'Video not found')
    }

    return res.status(200).json(
        new ApiResponse(200,video,'Video fetched successfully')
    )
})



const deleteVideo = asyncHandler(async(req,res) => {
    const videoId = req.params.id;
    if(!videoId) {
        throw new ApiError(400,'Video not found')
    }
    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(400,'Video not found')
    }
    console.log('req.user?._id : ',req.user?._id)
    console.log('video.owner: ',video.owner)

    if(req.user?._id.toString() !== video?.owner.toString()) {
        throw new ApiError(404,'You are not able to delete')
    }
    const deletedVideo = await Video.deleteOne({_id:videoId});
    return res.status(200).json(
        new ApiResponse(200,deletedVideo,'Video deleted successfully')
    )
})

const publishToggle = asyncHandler(async(req,res) => {
    const {videoId,isPublished} = req.body;

    if(!videoId) {
        throw new ApiError(400,'Video not found')
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(400,'Video not found')
    }

    console.log('isPublished : ',isPublished)

    if(isPublished === '' || isPublished === undefined || isPublished === null) {
        throw new ApiError(400,'Please provide publish status')
    }

    if(req.user?._id.toString() !== video?.owner.toString()) {
        throw new ApiError(404,'You are not able to edit')
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,    
        {
            $set:{
                isPublished
            }
        },
        {
            new:true
        }
    )

    if(!updatedVideo) {
        throw new ApiError(400,'Video enable to delete')
    }

    return res.status(200).json(
        new ApiResponse(200,updatedVideo,isPublished?'Video Published successfully':'Video Un published successfully')
    )
})


const updateVideo = asyncHandler(async(req,res) => {
    const {videoId,title ,description} = req.body;

     if(!videoId) {
            throw new ApiError(400,'Video not found')
        }

        const vid = await Video.findById(videoId)

    if(req.user?._id.toString() !== vid?.owner.toString()) {
        throw new ApiError(404,'You are not able to edit')
    }

    const thumbnailLocalPath = req.file?.path;

    let cloudThumbnail;

    if(thumbnailLocalPath) {
        cloudThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if(!cloudThumbnail?.url) {
            throw new ApiError(400,'Error while uploading thumbnail')
        }
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title:title || vid?.title,
                description: description || vid?.description,
                thumbnail: cloudThumbnail?.url || vid?.thumbnail,
            }
        },
        {
            new:true
        }
    )

    return res.status(200).json(
        new ApiResponse(200,video,'Video updated successfully')
    )

})


export {
    publishVideo,
    getAllVideo,
    getVideoById,
    deleteVideo,
    publishToggle,
    updateVideo
}