import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Like} from "../models/like.model.js"
import {Comment} from "../models/comment.model.js"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, uploadVideoCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"

// Helper to extract Cloudinary public_id from a URL
const getPublicId = (url) => url.split('/').slice(-1)[0].split('.')[0];


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    const pipeline = []

    // Match stage: build filter conditions
    const matchConditions = { isPublish: true }

    // Search by title or description using $regex
    if (query) {
        matchConditions.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    // Filter by userId (owner)
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId")
        }
        matchConditions.owner = new mongoose.Types.ObjectId(String(userId))
    }

    pipeline.push({ $match: matchConditions })

    // Sort stage
    const sortOrder = sortType === "asc" ? 1 : -1
    pipeline.push({ $sort: { [sortBy]: sortOrder } })

    // Lookup owner details
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        }
    )

    // Use aggregatePaginate for pagination
    const aggregate = Video.aggregate(pipeline)
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const result = await Video.aggregatePaginate(aggregate, options)

    return res.status(200).json(
        new ApiResponse(200, {
            docs: result.docs,
            totalDocs: result.totalDocs,
            page: result.page,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage
        }, "Videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if (!title?.trim()) {
        throw new ApiError(400, "Title is required")
    }

    // Validate files exist
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    // Upload video file to Cloudinary with explicit resource_type: "video"
    const videoFile = await uploadVideoCloudinary(videoFileLocalPath)
    if (!videoFile) {
        throw new ApiError(500, "Failed to upload video file to Cloudinary")
    }

    // Upload thumbnail to Cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail) {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary")
    }

    // Create video document
    const video = await Video.create({
        videofile: videoFile.url,
        thumbnail: thumbnail.url,
        title: title.trim(),
        description: description?.trim() || "",
        duration: videoFile.duration || 0,
        owner: req.user._id,
        isPublish: true,
        views: 0
    })

    const createdVideo = await Video.findById(video._id).populate("owner", "fullname username avatar")

    return res.status(201).json(
        new ApiResponse(201, createdVideo, "Video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Increment views by 1
    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true }
    ).populate("owner", "fullname username avatar")

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Add to watch history if user is authenticated (avoid duplicates)
    if (req.user) {
        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { watchHistory: video._id } }
        )
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Only owner can update
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    const updateFields = {}
    if (title?.trim()) updateFields.title = title.trim()
    if (description !== undefined) updateFields.description = description.trim()

    // Handle new thumbnail upload
    if (req.file) {
        // Delete old thumbnail from Cloudinary
        const oldPublicId = getPublicId(video.thumbnail)
        await deleteFromCloudinary(oldPublicId)

        const thumbnail = await uploadOnCloudinary(req.file.path)
        if (!thumbnail) {
            throw new ApiError(500, "Failed to upload new thumbnail")
        }
        updateFields.thumbnail = thumbnail.url
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    ).populate("owner", "fullname username avatar")

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Only owner can delete
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    // Delete video file and thumbnail from Cloudinary
    const videoPublicId = getPublicId(video.videofile)
    const thumbnailPublicId = getPublicId(video.thumbnail)

    await deleteFromCloudinary(videoPublicId, "video")
    await deleteFromCloudinary(thumbnailPublicId)

    // Delete all associated likes
    await Like.deleteMany({ video: videoId })

    // Delete all associated comments
    await Comment.deleteMany({ video: videoId })

    // Remove video from all playlists
    await Playlist.updateMany(
        { videos: videoId },
        { $pull: { videos: videoId } }
    )

    // Delete the video document
    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Only owner can toggle publish status
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to toggle publish status")
    }

    video.isPublish = !video.isPublish
    await video.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, video, `Video ${video.isPublish ? "published" : "unpublished"} successfully`)
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}