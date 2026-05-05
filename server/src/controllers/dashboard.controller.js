import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // Use req.user._id (the authenticated user's own channel)
    const userId = new mongoose.Types.ObjectId(String(req.user._id))

    // Total videos
    const totalVideos = await Video.countDocuments({ owner: userId })

    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: userId })

    // Total views across all videos (using aggregation $group + $sum)
    const viewsResult = await Video.aggregate([
        { $match: { owner: userId } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ])
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0

    // Total likes on all user's videos (use $lookup to find likes on user's videos)
    const likesResult = await Video.aggregate([
        { $match: { owner: userId } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: { $size: "$likes" } }
            }
        }
    ])
    const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0

    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalSubscribers,
            totalViews,
            totalLikes
        }, "Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // Use req.user._id (the authenticated user's own channel)
    const userId = new mongoose.Types.ObjectId(String(req.user._id))

    const videos = await Video.find({ owner: userId })
        .select("title thumbnail views isPublish createdAt duration")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
}