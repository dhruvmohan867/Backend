import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const totalVideos = await Video.countDocuments({channel: channelId})
    const totalSubscribers = await Subscription.countDocuments({channel: channelId})
    const totalLikes = await Like.countDocuments({video: {channel: channelId}})

    return res.status(200).json(new ApiResponse(200, {
        totalVideos,
        totalSubscribers,
        totalLikes
    }))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const videos = await Video.find({channel: channelId})
    return res.status(200).json(new ApiResponse(200, videos))
})

export {
    getChannelStats, 
    getChannelVideos
    }