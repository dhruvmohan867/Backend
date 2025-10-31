import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import {v2 as cloudinary} from 'cloudinary';

/*
 Exposed functions:
 - uploadVideo           (POST  /)                - requires auth, multipart/form-data: videofile, thumbnail, title, description, duration
 - getAllVideos          (GET   /)                - public, supports ?page=&limit=&q=
 - getVideoById          (GET   /:id)             - public
 - updateVideoDetails    (PUT   /:id)             - owner only
 - deleteVideo           (DELETE/:id)             - owner only (also removes cloudinary assets if public_id present)
 - incrementView         (POST  /:id/views)       - public, increments views atomically
*/

const uploadVideo = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Authentication required");

  const videoFile = req.files?.videofile?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];
  const { title, description, duration } = req.body;

  if (!videoFile || !thumbnailFile) throw new ApiError(400, "Videofile and thumbnail are required");
  if (!title || !duration) throw new ApiError(400, "title and duration are required");

  // Upload video and thumbnail to Cloudinary (resource_type:auto handles video)
  const videoUpload = await uploadCloudinary(videoFile.path);
  const thumbnailUpload = await uploadCloudinary(thumbnailFile.path);

  if (!videoUpload || !thumbnailUpload) throw new ApiError(500, "Failed to upload media");

  const created = await Video.create({
    videofile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    owner: userId,
    title,
    description: description || "",
    duration: Number(duration) || 0
  });

  const payload = await Video.findById(created._id).populate("owner", "username fullname avatar");
  return res.status(201).json(new ApiResponse(201, payload, "Video uploaded"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 12);
  const q = req.query.q ? String(req.query.q) : null;

  const filter = {};
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } }
    ];
  }

  const skip = (page - 1) * limit;
  const total = await Video.countDocuments(filter);
  const videos = await Video.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("owner", "username fullname avatar");

  return res.status(200).json(new ApiResponse(200, { videos, page, limit, total }, "Videos fetched"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(id).populate("owner", "username fullname avatar");
  if (!video) throw new ApiError(404, "Video not found");

  return res.status(200).json(new ApiResponse(200, video, "Video fetched"));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, "Video not found");
  if (!video.owner.equals(userId)) throw new ApiError(403, "Not authorized");

  const updates = {};
  ["title", "description", "isPublish", "duration"].forEach((k) => {
    if (k in req.body) updates[k] = req.body[k];
  });

  const updated = await Video.findByIdAndUpdate(id, { $set: updates }, { new: true }).populate("owner", "username fullname avatar");
  return res.status(200).json(new ApiResponse(200, updated, "Video updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, "Video not found");
  if (!video.owner.equals(userId)) throw new ApiError(403, "Not authorized");

  // Attempt to remove cloudinary asset(s) if public_id exists in stored data
  // If your upload stored public_id, use it; here we try to extract public_id from URL if present (best-effort)
  try {
    const extractPublicId = (url) => {
      // URL shape: https://res.cloudinary.com/<cloud>/video/upload/vxxx/<public_id>.<ext>
      const parts = url?.split("/").slice(6); // after .../upload/
      if (!parts) return null;
      const last = parts.join("/").split(".")[0];
      return last || null;
    };
    if (video.videofile) {
      const pid = extractPublicId(video.videofile);
      if (pid) await cloudinary.uploader.destroy(pid, { resource_type: "auto" }).catch(()=>{});
    }
    if (video.thumbnail) {
      const pid2 = extractPublicId(video.thumbnail);
      if (pid2) await cloudinary.uploader.destroy(pid2, { resource_type: "image" }).catch(()=>{});
    }
  } catch (err) {
    // ignore deletion errors
  }

  await Video.findByIdAndDelete(id);
  return res.status(200).json(new ApiResponse(200, null, "Video deleted"));
});

const incrementView = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid video id");

  const updated = await Video.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
  if (!updated) throw new ApiError(404, "Video not found");
  return res.status(200).json(new ApiResponse(200, { views: updated.views }, "View incremented"));
});

export {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
  incrementView
};