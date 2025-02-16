import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Video, User, Like } from "../models/index.js";
import mongoose from "mongoose";

const getChannelStats = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const stats = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        likeCount: { $size: "$likes" },
        totalViews: { $sum: "$videos.views" },
      },
    },
    {
      $project: {
        subscriberCount: 1,
        likeCount: 1,
        totalViews: 1,
        videos:1
      },
    },
  ]);

  if (!stats.length) {
    throw new ApiError(404, "Channel stats not found");
  }

  res.status(200).json(new ApiResponse(200, stats[0], "Channel stats fetched successfully"));
});

const getChannelVideos = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const videos = await Video.find({ owner: userId }).select("-updatedAt");
  res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

const getLikesAndDislikesCount = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const videos = await Video.find({ owner: new mongoose.Types.ObjectId(req.user._id) }).select("_id");

  const videoIds = videos.map(video => video._id);

  const likesAndDislikes = await Like.aggregate([
    { $match: { video: { $in: videoIds } } },
    {
      $group: {
        _id: "$video",
        likes: { $sum: { $cond: ["$likeStatus", 1, 0] } },
        dislikes: { $sum: { $cond: ["$likeStatus", 0, 1] } },
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, likesAndDislikes, "Likes and dislikes count fetched successfully"));
});

export { getChannelStats, getChannelVideos, getLikesAndDislikesCount };
