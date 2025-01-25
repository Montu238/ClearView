import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/index.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { COOKIE_OPTION } from "../constants.js";
import jwt from "jsonwebtoken";



/**
 * updates the password to new one
 */
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
 
     res.status(200).json(
         new ApiResponse(200, {}, "Password changed successfully")
     );
 });

/**
 * updates user avatar
 */
const updateAvatar = AsyncHandler(async(req,res)=>{
     const avatarLocalPath = req.file?.path;
     
     if(!avatarLocalPath){
          throw new ApiError(400,"Avatar image is required");
     }
     const avatar= await uploadOnCloudinary(avatarLocalPath);

     if(!avatar){
          throw new ApiError(400,"Failed to upload avatar");
     }

     const user = await User.findByIdAndUpdate(
          req.user?._id,
          {$set:{avatar:avatar.url}},
          {
               new:true,
          }
     ).select("-password -watchHistory");

     res
     .status(200)
     .json(
          new ApiResponse(200,user,"avatar updated succesfully")
     );

});

/**
 * updates the cover image
 */
const updateCoverImage = AsyncHandler(async(req,res)=>{
     const coverLocalPath = req.file?.path;
     if(!coverLocalPath){
          throw new ApiError(400,"cover image is required");
     }
     const coverImage= await uploadOnCloudinary(coverLocalPath);

     if(!coverImage){
          throw new ApiError(400,"Failed to upload cover image");
     }

     const user = await User.findByIdAndUpdate(
          req.user?._id,
          {$set:{coverImage:coverImage.url}},
          {
               new:true,
          }
     ).select("-password -watchHistory");

     res
     .status(200)
     .json(
          new ApiResponse(200,user,"cover image updated succesfully")
     );

});

/**
 * returns the details of current user
 */
const getCurrentUser = AsyncHandler(async(req,res)=>{
     const user = await User.findById(req.user?._id).select("-password -watchHistory");
     if(!user){
          throw new ApiError(404,"User not found");
     }
     res
     .status(200)
     .json(
          new ApiResponse(200,user,"user found successfully")
     );
});

/**
 * Updates the user's full name and email.
 */
const updateUserDetails = AsyncHandler(async(req,res)=>{
     // Step 1: Validate that fullName and email are provided
     let {fullName,email} = req.body;

     if([fullName,email].some(field=>field.trim()==="")){
          throw new ApiError(400,"all fields are required");
     }

      fullName=fullName.trim();
      email=email.trim();
     // Step 2: Check if the provided email already exists in the database
     const userWithProvidedEmail = await User.findOne({email});
     if(userWithProvidedEmail){
          throw new ApiError(400,"email already exists");
     }

     // Step 3: Update the user's details in the database
     const user = await User.findByIdAndUpdate(
          req.user?._id,
          {$set:{fullName,email}},
     );

     if(!user){
          throw new ApiError(500,"error updating user details");
     }

     // Step 4: Send a success response
     res
     .status(200)
     .json(
          new ApiResponse(200,{},"user details updated successfully")
     )
});



export const userController = { 
     changeCurrentPassword,
     updateAvatar,
     updateCoverImage,
     getCurrentUser,
     updateUserDetails
};