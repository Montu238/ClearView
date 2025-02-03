import mongoose from "mongoose";
import { User } from "../models/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/index.js";
import {
  uploadOnImageCloudinary,
  deleteImageOnCloudinary,
  uploadVideoOnCloudinary,
  deleteVideoOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = AsyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  let filter = {};
  if (query) {
    filter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };
  }
  if (userId) filter.owner = userId;

  const videos = await Video.find(filter)
    .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
    .populate("owner", "userName avatar")
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const totalVideos = await Video.countDocuments(filter);
  const totalPages = Math.ceil(totalVideos / limitNumber);
  if (videos?.length < 1) {
    res.status(200).json(
      new ApiResponse(
        200,
        {
          videos,
          currentPage: pageNumber,
          totalPages,
          totalVideos,
        },
        "no videos found"
      )
    );
  } else {
    res.status(200).json(
      new ApiResponse(
        200,
        {
          videos,
          currentPage: pageNumber,
          totalPages,
          totalVideos,
        },
        "success"
      )
    );
  }
});

const postVideo = AsyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      throw new ApiError(400, "title and description both are required");
    }
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!videoFileLocalPath || !thumbnailLocalPath) {
      throw new ApiError(400, "videoFile and thumbnail both are required");
    }
    const uploadedVideo = await uploadVideoOnCloudinary(videoFileLocalPath);
    const uploadedThumbnail = await uploadOnImageCloudinary(thumbnailLocalPath);
    const duration = uploadedVideo.duration;
    const video = await Video.create({
      title,
      description,
      duration,
      videoFile: uploadedVideo.url,
      thumbnail: uploadedThumbnail.url,
      owner: new mongoose.Types.ObjectId(req.user._id),
    });
    res
      .status(201)
      .json(new ApiResponse(201, video, "video uploaded successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "failed to upload video");
  }
});

const getVideoById = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId).populate(
    "owner",
    "userName avatar"
  );
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  res.status(200).json(new ApiResponse(200, video, "video found successfully"));
});

const deleteVideo = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "videoId is required");
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "video not found");
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you are not authorized to delete this video");
  }
  try {
    await deleteVideoOnCloudinary(video.videoFile);
    await deleteImageOnCloudinary(video.thumbnail);
  } catch (error) {
    throw new ApiError(500, error.message || "failed to delete video");
  }
  await Video.findByIdAndDelete(videoId);
  res.status(200).json(new ApiResponse(200, {}, "video deleted successfully"));
});

const updateVideo = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(401, "title and description both are required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you are not authorized to update this video");
  }
  video.title = title;
  video.description = description;
  if (req.file) {
    const thumbnailLocalPath = req.file.path;
    const uploadedThumbnail = await uploadOnImageCloudinary(thumbnailLocalPath);
    await deleteImageOnCloudinary(video.thumbnail);
    video.thumbnail = uploadedThumbnail.url;
    await video.save();
  } else {
    await video.save();
  }
  res
    .status(200)
    .json(new ApiResponse(200, video, "video details updated successfully"));
});

const togglePublishStatus = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const result = await Video.findById(videoId);
  if (!result) {
    throw new ApiError(404, "video not found");
  }
  if(result.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you are not authorized to toggle publish status");
  }
  result.isPublished = !result.isPublished;
  await result.save();
  res
    .status(200)
    .json(new ApiResponse(200, {}, "toggled publish status successfully"));
});

export const videoController = {
  getAllVideos,
  getVideoById,
  deleteVideo,
  postVideo,
  updateVideo,
  togglePublishStatus,
};
