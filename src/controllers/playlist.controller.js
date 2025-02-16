import { Playlist, User, Video } from "../models/index.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";

const validateMongodbId = (id, idName) => {
  if (!id?.trim()) {
    throw new ApiError(401, `${idName} is required`);
  }
  return new mongoose.Types.ObjectId(id);
};

const validatePlaylistOwnership = (playlist, userId) => {
  if (!playlist) {
    throw new ApiError(404, "No playlist found!");
  }
  if (!playlist.owner.equals(userId)) {
    throw new ApiError(403, "You are not authorized to modify this playlist");
  }
};

const createPlaylist = AsyncHandler(async (req, res) => {
  const { name, description = "" } = req.body;
  if (!name?.trim()) {
    throw new ApiError(401, "Name is required!");
  }

  const playlist = await Playlist.create({
    owner: req.user._id,
    name,
    description: description.trim(),
  });

  res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getPlaylistById = AsyncHandler(async (req, res) => {
  const playlistId = validateMongodbId(req.params.playlistId, "playlistId");
  const playlist = await Playlist.findById(playlistId).select(
    "-createdAt -updatedAt"
  ).populate("videos");

  if (!playlist) {
    throw new ApiError(404, "No playlist found!");
  }

  res.status(200).json(new ApiResponse(200, playlist));
});

const updatePlaylist = AsyncHandler(async (req, res) => {
  const playlistId = validateMongodbId(req.params.playlistId, "playlistId");
  const { name, description = "" } = req.body;
  if (!name?.trim()) {
    throw new ApiError(401, "Name is required!");
  }

  const playlist = await Playlist.findById(playlistId);
  validatePlaylistOwnership(playlist, req.user._id);

  playlist.name = name;
  playlist.description = description.trim();
  await playlist.save();

  res.status(200).json(new ApiResponse(200, playlist, "Updated successfully!"));
});

const deletePlaylist = AsyncHandler(async (req, res) => {
  const playlistId = validateMongodbId(req.params.playlistId, "playlistId");
  const playlist = await Playlist.findById(playlistId);
  validatePlaylistOwnership(playlist, req.user._id);

  await Playlist.findByIdAndDelete(playlistId);
  res.status(200).json(new ApiResponse(200, {}, "Playlist deleted!"));
});

const addVideoToPlaylist = AsyncHandler(async (req, res) => {
  try {
    const videoId = validateMongodbId(req.params.videoId, "videoId");
    const playlistId = validateMongodbId(req.params.playlistId, "playlistId");
    const playlist = await Playlist.findById(playlistId);
    validatePlaylistOwnership(playlist, req.user._id);

    const videoExists = playlist.videos.some((video) => video === videoId);
    if (videoExists) {
      throw new ApiError(400, "Video already exists in the playlist!");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res
      .status(201)
      .json(new ApiResponse(201, playlist, "Video added successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error adding video to playlist!");
  }
});

const removeVideoFromPlaylist = AsyncHandler(async (req, res) => {
  try {
    const videoId = validateMongodbId(req.params.videoId, "videoId");
    const playlistId = validateMongodbId(req.params.playlistId, "playlistId");

    // Check if the video exists in the database
    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
      throw new ApiError(404, "Video not found in the database!");
    }

    const playlist = await Playlist.findById(playlistId);
    validatePlaylistOwnership(playlist, req.user._id);

    const videoIndex = playlist.videos.indexOf(videoId);
    if (videoIndex > -1) {
      playlist.videos.splice(videoIndex, 1);
      await playlist.save();
      res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed successfully"));
    } else {
      throw new ApiError(404, "Video not found in the playlist!");
    }
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Error removing video from playlist!"
    );
  }
});

const getUserPlaylists = AsyncHandler(async (req, res) => {
  const userId = validateMongodbId(req.params.userId, "userId");

  const user = await User.findById(userId);
  if (!user){
    throw new ApiError(404, "User not found");

  } 

  const playlists = await Playlist.find({ owner: userId }).populate("videos");

  if (playlists.length < 1) {
    res
      .status(200)
      .json(new ApiResponse(200, [], "User has not created any playlist yet"));
  } else res.status(200).json(new ApiResponse(200, playlists));
});

export const playListController = {
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
};
