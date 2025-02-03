import { Like } from "../models/index.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const toggleVideoLike = AsyncHandler(async (req, res) => {
      const { videoId } = req.params;
      const userId = req.user?._id;
      
      const like = await Like.findOne({ video: videoId, likedBy: userId });
      
      if (like) {
      like.likeStatus = !like.likeStatus;
      await like.save();
      return res.status(201).json(new ApiResponse(201, {}, "Video disliked"));
      }
      
      await Like.create({ video: videoId, likedBy: new mongoose.Types.ObjectId(userId), likeStatus: true });
      
      res.status(201).json(new ApiResponse(201, {}, "Video liked"));
});

const toggleCommentLike = AsyncHandler(async (req, res) => {
      const { commentId } = req.params;
      const userId = req.user?._id;
      let isAlredyLiked = false;
      const like = await Like.findOne({ comment: commentId, likedBy: userId });
      if(like){
            await Like.findByIdAndDelete(like._id);
            isAlredyLiked = true;
      }
      else {
            await Like.create({ comment: commentId, likedBy: new mongoose.Types.ObjectId(userId), likeStatus: true });
      }
     if(isAlredyLiked){
       res.status(201).json(new ApiResponse(201, {}, "removed liked from comment"));
     }
     else{
      res.status(201).json(new ApiResponse(201, {}, "Comment liked"));
     }
});

const toggleTweetLike = AsyncHandler(async (req, res) => {
      const { tweetId } = req.params;
      const userId = req.user?._id;
      
      const like = await Like.findOne({ tweet: tweetId, likedBy: userId });
      
      if (like) {
      like.likeStatus = !like.likeStatus;
      await like.save();
      return res.status(201).json(new ApiResponse(201, {}, "Tweet disliked"));
      }
      
      await Like.create({ tweet: tweetId, likedBy: new mongoose.Types.ObjectId(userId), likeStatus: true });
      
      res.status(201).json(new ApiResponse(201, {}, "Tweet liked"));
});

const getLikedVideos = AsyncHandler(async (req, res) => {
      const userId = req.user?._id;
      const likedVideos = await Like.find({likedBy:userId,likeStatus:true,video:{$ne:null}}).populate("video","_id title thumbnailUrl owner views");
      if(!likedVideos){
            likedVideos=[];
      } 
      res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
