import { Comment } from "../models/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = AsyncHandler(async (req, res) => {});

const addComment = AsyncHandler(async (req, res) => {});

const deleteComment = AsyncHandler(async (req, res) => {});

const updateComment = AsyncHandler(async (req, res) => {});

export const commentController = { 
      getVideoComments,
      addComment,
      deleteComment,
      updateComment,
};