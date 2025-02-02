import { Playlist } from "../models/index.js";
import { ApiResponse } from "../utils/apiResponse.js";
import AsyncHandler from "../middlewares/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const createplayList = AsyncHandler(async (req, res) => {});

const getPlaylistById = AsyncHandler(async (req, res) => {});

const updatePlaylist = AsyncHandler(async (req, res) => {});

const deletePlaylist = AsyncHandler(async (req, res) => {});

const addVideoToPlaylist = AsyncHandler(async (req, res) => {});

const removeVideoFromPlaylist = AsyncHandler(async (req, res) => {});

const getUserPlaylists = AsyncHandler(async (req, res) => {});

export const PlaylistController = {
  createplayList,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
};
