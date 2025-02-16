import { Tweet, User } from "../models/index.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";


const validateTweetOwnership = (tweet, userId) => {
  if (!tweet) {
    throw new ApiError(404, "No tweet found!");
  }
  if (!tweet.owner.equals(userId)) {
    throw new ApiError(403, "You are not authorized to modify this tweet");
  }
};

const createTweet = AsyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content?.trim == "") {
      throw new ApiError(400, "Content is required");
    }
    const tweet = await Tweet.create({
      content,
      owner: new mongoose.Types.ObjectId(req.user._id),
    });
    res
      .status(201)
      .json(new ApiResponse(201, tweet, "Tweet created successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "failed to create tweet!");
  }
});

const getUserTweets = AsyncHandler(async (req, res) => {
try {
      const { userId } = req.params;
      const userExists = await User.exists({_id:new mongoose.Types.ObjectId(req.user._id)});
      if (!userExists) {
            throw new ApiError(404, "User not found");
      }
      const tweets = await Tweet.find({ owner: userId }).select("-updatedAt -owner -__v");
      let responseMessage=null;
      if(tweets.length < 1){
         responseMessage = "User haven't posted any tweets yet"
      }
      res
            .status(200)
            .json(new ApiResponse(200, tweets, responseMessage || "User tweets fetched successfully"));
} catch (error) {
      throw new ApiError(500, error.message || "error retrieving tweets !");
}
});

const updateTweet = AsyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const tweet = await Tweet.findById(tweetId);
  validateTweetOwnership(tweet, req.user._id);
  tweet.content = content;
  await tweet.save();
  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = AsyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const tweet = await Tweet.findById(tweetId);
  validateTweetOwnership(tweet, req.user._id);
  await Tweet.findByIdAndDelete(tweet._id);
  res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

const getTweetById = AsyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const tweet = await Tweet.findById(tweetId).select("-updatedAt");
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet fetched successfully"));
});

export const tweetController = {
  createTweet,
  getTweetById,
  updateTweet,
  deleteTweet,
  getUserTweets,
};
