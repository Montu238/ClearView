import { Comment } from "../models/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getVideoComments = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  const comments = await Comment.find({ video: videoId })
    .populate("commentedBy", "username avatar")
    .select("-video -__v -updatedAt")
    .sort({ createdAt: -1 });
  if (comments?.length < 1) {
    res.status(200).json(new ApiResponse(200, [], "no one has commented yet"));
  }else{
  res.status(200).json(new ApiResponse(200, comments));
  }
});

const addComment = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId || !content) {
    throw new ApiError(400, "Video id and content both are required");
  }
  const comment = await Comment.create({
    content,
    video: new mongoose.Types.ObjectId(videoId),
    commentedBy: new mongoose.Types.ObjectId(req.user._id),
  });
  res.status(201).json(new ApiResponse(201, comment));
});

const deleteComment = AsyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }
  const comment = await Comment.deleteOne({
    _id: commentId,
    commentedBy: req.user._id,
  });
  if (comment?.length < 0) {
    throw new ApiError(401, "not authorized to delete this comment");
  }
  res.status(200).json(new ApiResponse(200, {}, "deleted"));
});

const updateComment = AsyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!commentId || !content) {
    throw new ApiError(400, "Comment id and content are required");
  }
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, commentedBy: req.user._id },
    { content },
    { new: true }
  );
  if (comment?.length < 0) {
    throw new ApiError(401, "not authorized to update this comment");
  }
  res.status(200).json(new ApiResponse(200, comment));
});

export const commentController = {
  getVideoComments,
  addComment,
  deleteComment,
  updateComment,
};
