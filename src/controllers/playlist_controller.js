//createPlaylist
//getUserPlaylists
//getPlaylistById
//addVideoToPlaylist
//removeVideoFromPlaylist
//deletePlaylist
//updatePlaylist

import mongoose  from 'mongoose';
import {Playlist} from '../models/playlist_model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_response.js';
import { asyncHandler } from '../utils/async_handler.js';

const createPlaylist = asyncHandler(async(req,res) => {
    const {name,description} = req.body;
    if(!name) {
        throw new ApiError(400,'Name is required')
    }
    if(!description) {
        throw new ApiError(400,'Description is required')
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user?._id
    })

    if(!playlist) {
        throw new ApiError(400,'Invalid')
    }

    return res.status(200).json(
        new ApiResponse(200,playlist,'Playlist created successfully')
    )
})

const getUserPlaylist = asyncHandler(async(req,res) => {
    const {userId} = req.body;
    if(!userId) {
        throw new ApiError(400,'Channel not exist')
    }
    
    if(!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400,'Id not valid')
    }
    console.log('hello');
    const playlists = await Playlist.find({owner:userId});
    console.log('playlist : ',playlists);
    if(!playlists) {
        throw new ApiError(400,'Playlist not found')
    }

    return res.status(200).json(
        new ApiResponse(200,playlists,'Playlist fetched successfully'))
})

const getUserPlaylistById = asyncHandler(async(req,res) => {
    const {_id} = req.params;
    console.log('id : ',_id)
    if(!_id) {
        throw new ApiError(400,'Id is required')
    }
    
    if(!mongoose.Types.ObjectId.isValid(_id)) {
        throw new ApiError(400,'Id not valid')
    }
    console.log('hello');
    const playlists = await Playlist.findById({_id});
    console.log('playlist : ',playlists);
    if(!playlists) {
        throw new ApiError(400,'Playlist not found')
    }

    return res.status(200).json(
        new ApiResponse(200,playlists,'Playlist fetched successfully'))
})

const deletePlaylist = asyncHandler(async(req,res) => {
    const {playlistId} = req.body;
    if(!playlistId) {
        throw new ApiError(400,'Playlist not found')
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist) {
        throw new ApiError(400,'Playlist not found')
    }

    if(req.user?._id.toString() !== playlist.owner.toString()) {
        throw new ApiError(400,'You are not owner of this playlist')
    }

    const deletedPlaylist = await Playlist.deleteOne({_id:playlistId});

    return res.status(200).json(
        new ApiResponse(200,deletedPlaylist,'Playlist deleted successfully')
    )
})

const updatePlaylist = asyncHandler(async(req,res) => {
    const {playlistId,name,description} = req.body;
    if(!playlistId) {
        throw new ApiError(400,'Playlist not found')
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist) {
        throw new ApiError(400,'Playlist not found')
    }

    if(req.user?._id.toString() !== playlist.owner.toString()) {
        throw new ApiError(400,'You are not owner of this playlist')
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name:name || playlist.name,
                description:description || playlist.description,
            }
        },
        {
            new:true
        }
    );

    return res.status(200).json(
        new ApiResponse(200,updatedPlaylist,'Playlist updated successfully')
    )
})

const addVideo = asyncHandler(async(req,res) => {
    const {playlistId,videoIds} = req.body;
    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400,'Playlist id invalid')
    }

    if(!Array.isArray(videoIds)) {
        throw new ApiError(400,'Vide must be in list')
    }

    videoIds.map((id) => {
        if(!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400,'Video id invalid')
        }
    })

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(400,'Playlist not found')
    }
    if(playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400,'You are not owner')
    }
    const videos = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                videos:videoIds
            }
        },
        {
            new:true
        }
    );

    return res.status(200).json(
        new ApiResponse(200,videos,'Video added successfully')
    )
})

const removeVideo = asyncHandler(async(req,res) => {
    const {playlistId,videoIds} = req.body;
    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400,'Playlist id invalid')
    }

    if(!Array.isArray(videoIds)) {
        throw new ApiError(400,'Vide must be in list')
    }

    videoIds.map((id) => {
        if(!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400,'Video id invalid')
        }
    })

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(400,'Playlist not found')
    }
    if(playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400,'You are not owner')
    }
    const videos = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $unset:{
                videos:videoIds
            }
        },
        {
            new:true
        }
    );

    return res.status(200).json(
        new ApiResponse(200,videos,'Video removed successfully')
    )
})

export {createPlaylist,getUserPlaylist,getUserPlaylistById,deletePlaylist,updatePlaylist,addVideo,removeVideo}