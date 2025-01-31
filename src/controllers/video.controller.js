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
  if (query) filter.$text = { $search: query };
  if (userId) filter.owner = userId;

  const videos = await Video.find(filter, { isPublished: -1 })
    .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .lean();

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
  }

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
    const duration = uploadedVideo.metadata.duration;
    const video = await Video.create({
      title,
      description,
      duration,
      videoFile: uploadedVideo.url,
      thumbnail: uploadedThumbnail.url,
      owner: req.user._id,
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
  const video = await Video.findById(videoId);
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
  await deleteVideoOnCloudinary(video.videoFile);
  await deleteImageOnCloudinary(video.thumbnail);
  await Video.findByIdAndDelete(videoId);
  res.status(200).json(new ApiResponse(200, {}, "video deleted successfully"));
});

const updateVideo = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if(!title || !description){
      throw new ApiError(401,"title and description both are required")
  }
  const video = await Video.findByIdAndUpdate(
      videoId,
      {$set:{title,description}}
  );
      if(!result){
      throw new ApiError(404,"video not found")
      }
      res.status(200).json(
            new ApiResponse(200,video,"video details updated successfully")
      );
});

const togglePublishStatus = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const result = await Video.findByIdAndUpdate(
      videoId,
      {$set:{isPublished:{ $not: "$isPublished" }}}
);
if(!result){
      throw new ApiError(404,"video not found");

}
res.status(200).json(new ApiResponse(200,{},"toggled publish status successfully"));
});

export const videoController = {
  getAllVideos,
  getVideoById,
  deleteVideo,
  postVideo,
  updateVideo,
  togglePublishStatus,
};
