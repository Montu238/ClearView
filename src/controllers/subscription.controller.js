import { Subscription } from "../models/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";

const getSubscribedChannels = AsyncHandler(async (req, res) => {});

const toggleSubscription = AsyncHandler(async (req, res) => {});

const getUserChannelSubscribers = AsyncHandler(async (req, res) => {});

export const subscriptionController = {
      getSubscribedChannels,
      toggleSubscription,
      getUserChannelSubscribers,
};