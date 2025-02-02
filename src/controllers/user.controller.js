import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/index.js";
import {
  uploadOnImageCloudinary,
  deleteImageOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const changeCurrentPassword = AsyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = await user.comparePassword(oldPassword);

  if (!isValidPassword) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateAvatar = AsyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }
  const avatar = await uploadOnImageCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }
  const user = await User.findById(req.user?._id).select(
    "-password -watchHistory "
  );
  const oldUserAvatarPublicUrl = user.avatar;
  await deleteImageOnCloudinary(oldUserAvatarPublicUrl);

  user.avatar = avatar.url;
  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        newUrl: user.avatar,
      },
      "avatar updated succesfully"
    )
  );
});

const updateCoverImage = AsyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;
  if (!coverLocalPath) {
    throw new ApiError(400, "cover image is required");
  }
  const coverImage = await uploadOnImageCloudinary(coverLocalPath);

  if (!coverImage) {
    throw new ApiError(400, "Failed to upload cover image");
  }

  const user = await User.findById(req.user?._id).select(
    "-password -watchHistory"
  );
  await deleteImageOnCloudinary(user.coverImage);
  user.coverImage = coverImage.url;
  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        newUrl: user.coverImage,
      },
      "cover image updated succesfully"
    )
  );
});

const getCurrentUser = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -watchHistory"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(new ApiResponse(200, user, "user found successfully"));
});

const updateUserDetails = AsyncHandler(async (req, res) => {
  // Step 1: Validate that fullName and email are provided
  let { fullName, email } = req.body;

  if ([fullName, email].some((field) => field.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }

  fullName = fullName.trim();
  email = email.trim();
  // Step 2: Check if the provided email already exists in the database
  const userWithProvidedEmail = await User.findOne({ email });
  if (userWithProvidedEmail) {
    throw new ApiError(400, "email already exists");
  }

  // Step 3: Update the user's details in the database
  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: { fullName, email },
  });

  if (!user) {
    throw new ApiError(500, "error updating user details");
  }

  // Step 4: Send a success response
  res
    .status(200)
    .json(new ApiResponse(200, {}, "user details updated successfully"));
});

const getUserChannelProfile = AsyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) throw new ApiError(400, "username is missing");
  try {
    const channelProfile = await User.aggregate([
      {
        $match: {
          userName: username.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subcribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscriberCount: { $size: "$subcribers" },
          subscribedToCount: { $size: "$subscribedTo" },
          isSubscribed: {
            $cond: {
              if: { $in: [req.user?._id, "$subcribers.subscriber"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          userName: 1,
          fullName: 1,
          avatar: 1,
          coverImage: 1,
          subscriberCount: 1,
          subscribedToCount: 1,
          isSubscribed: 1,
        },
      },
    ]);
    if (!channelProfile?.length) {
      throw new ApiError(404, "user channel profile not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          channelProfile[0],
          "user channel profile found successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "error getting user channel profile");
  }
});

const getWatchHistory = AsyncHandler(async (req, res) => {
  try {
    const userWatchHistory = await User.aggregate([
      {
        $match: {
          userName: req.user?.username?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
        },
      },
      {
        $addFields: {
          watchHistory: { $reverseArray: "$watchHistory" },
        },
      },
      {
        $project: {
          watchHistory: 1,
        },
      },
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userWatchHistory,
          "watch history found successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message || "error getting watch history");
  }
});

export const userController = {
  changeCurrentPassword,
  updateAvatar,
  updateCoverImage,
  getCurrentUser,
  updateUserDetails,
  getUserChannelProfile,
  getWatchHistory,
};
