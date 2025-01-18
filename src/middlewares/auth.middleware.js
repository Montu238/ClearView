import { ApiError } from "../utils/apiError.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/index.js";
import jwt from "jsonwebtoken";

const verifyJwt = AsyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
    console.log("Token:", token); // Log the token for debugging
    if (!token) {
      throw new ApiError(403, "Access token not provided");
    }
    const decodedUser  = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedUser ) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = decodedUser ;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired");
    }
    throw error;
  }
});

export {verifyJwt};