import mongoose from "mongoose";
import { Subscription } from "../models/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = AsyncHandler(async (req, res) => {
  const { channelId } = req.params;
  try {
    if (channelId?.trim() == "") {
      throw new ApiError(403, "channelId is required");
    }

    const subscription = await Subscription.findOne({
      channel: new mongoose.Types.ObjectId(channelId),
      subscriber: new mongoose.Types.ObjectId(req.user._id),
    });

    if (subscription) {
      await Subscription.deleteOne({
        channel: channelId,
        subscriber: req.user._id,
      });
      res.status(200).json(new ApiResponse(200, {}, "unsubscribed"));
    } else {
      await Subscription.create({
        channel: new mongoose.Types.ObjectId(channelId),
        subscriber: new mongoose.Types.ObjectId(req.user._id),
      });
      res.status(200).json(new ApiResponse(200, {}, "subscribed"));
    }
  } catch (error) {
    throw new ApiError(500, error.message || "failed to toggle subscription");
  }
});


const getSubscribedChannels = AsyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  try {
    if (subscriberId?.trim() == "") {
      throw new ApiError(403, "subscriberId is required");
    }

    const subscribedChannels = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscriberId),
        },
      },
      {
        $lookup: {
          from: "user ",
          localField: "channel",
          foreignField: "_id",
          as: "subscribedChannels",
        },
      },
      {
        $project: {
          _id: 0, // Parent document ID
          "subscribedChannels._id": 1, // Subscribed channel ID
          "subscribedChannels.userName": 1, // Subscribed channel username
          "subscribedChannels.avatar": 1, // Subscribed channel avatar
        },
      },
    ]);
    res.status(200).json(new ApiResponse(200, subscribedChannels));
  } catch (error) {
    throw new ApiError(500, error.message || "failed to get subscribers");
  }
});

const getUserChannelSubscribers = AsyncHandler(async (req, res) => {
  const { channelId } = req.params;
  try {
    if (channelId?.trim() == "") {
      throw new ApiError(403, "channelId is required");
    }
    const subscribersList = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: "user ",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscribers",
        },
      },
      {
        $project: {
          _id: 0,
          "subscribers._id": 1, //  subscriber ID
          "subscribers.userName": 1, //  subscriber username
          "subscribers.avatar": 1, //  subscriber avatar
        },
      },
    ]);
    res.status(200).json(new ApiResponse(200, subscribersList));
  } catch (error) {
    throw new ApiError(500, error.message || "failed to get subscribers");
  }
});


export const subscriptionController = {
  getSubscribedChannels,
  toggleSubscription,
  getUserChannelSubscribers,
};
