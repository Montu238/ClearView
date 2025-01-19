import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/index.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { COOKIE_OPTION } from "../constants.js";
import jwt from "jsonwebtoken";

//utility functions for user
const generateAcessTokenAndRefreshToken = async (user) => {
     try {
          const accessToken = await user.generateAccessToken();
          const refreshToken = await user.generateRefreshToken();
          user.refreshToken = refreshToken;
          await user.save();
          return { accessToken, refreshToken };
     } catch (error) {
          throw new ApiError(500, "error in generating tokens");
     }
}

const sanitizeUser = (user) => {
     return {
          ...user.toObject(),
          password: undefined,
          watchHistory: [],
          refreshToken: undefined,
     };
}

//controller functions for user

/**
 * creates new user
 */
const register = AsyncHandler(async (req, res) => {
     //step 1: fields validations
     const { userName, email, fullName, password } = req.body;
     if ([userName, email, fullName, password].some((element) => element?.trim() === "")) {
          throw new ApiError(400, "All fields are required !");
     }
     //step 2: check if user already exists :username ,email
     const existingUser = await User.findOne({
          $or: [{ userName }, { email }]
     });
     if (existingUser) {
          throw new ApiError(409, "User already exists !\n");
          console.log(user);
     }
     //step 3:check for files
     const avatarLocalPath = req.files?.avatar[0]?.path;
     if (!avatarLocalPath) {
          throw new ApiError(400, "avatar is required");
     }
     let coverImageLocalPath;
     if (req.files.coverImage && req.files.coverImage.length > 0) {
          coverImageLocalPath = req.files.coverImage[0].path;
     }
     //step 4: check files are successfully uploaded on cloudinary :avatar,coverImage
     const avatar = await uploadOnCloudinary(avatarLocalPath);
     let coverImage;
     if (coverImageLocalPath) {
          coverImage = await uploadOnCloudinary(coverImageLocalPath);
     }
     if (!avatar) {
          throw new ApiError(500, "failed to upload on cloudinary")
     }

     //step 5:create user object and add in DB
     const user = await User.create({
          userName: userName.toLowerCase(),
          email,
          fullName,
          password,
          avatar: avatar.url,
          coverImage: coverImage?.url || ""
     });
     //step 7:check for user creation
     const createdUser = await User.findById(user._id).select(
          "-password -refreshToken -watchHistory"
     );
     if (!createdUser) {
          throw new ApiError(500, "something went wrong while registering user");
     }

     //step 8:send response to client 
     res.status(201).json(
          new ApiResponse(201, createdUser, " user registered successfully")
     );
});

/**
 * login the user
 */
const loginUser = AsyncHandler(async (req, res) => {
     //step 1:take credentials from request
     const { userName,password } = req.body;

     //step 2:check fields 
       if (!password) {
          throw new ApiError(400, "Password is required");
        }
      
        // Step 3: Check that either userName or email exists
        if (!userName) {
          throw new ApiError(400, "userName is required");
        }
     //step 3:check that user exist in DB
     const user = await User.findOne(
         { $or: [{ userName: userName.toLowerCase() }] }
     );
     if (!user) {
          throw new ApiError(404, "user not found");
     }
     //step 4:verify password
     const isValidPassword = await user.comparePassword(password);
     if (!isValidPassword) {
          throw new ApiError(401, "invalid password");
     }
     //step 5:generate access and refresh token

     const { accessToken, refreshToken } = await generateAcessTokenAndRefreshToken(user);

     const loggedInUser = sanitizeUser(user);

     //set cookies and send response 
     res.status(200)
          .cookie("accessToken", accessToken,COOKIE_OPTION)
          .cookie("refreshToken", refreshToken,COOKIE_OPTION)
          .json(
               new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, "Login successfull")
          )

});

/**
 * logs out user
 */
const logoutUser = AsyncHandler(async (req, res) => {
     // Step 1: Clear cookies (accessToken and refreshToken)
     try {
          res.clearCookie("accessToken");
          res.clearCookie("refreshToken");
     
          // Step 2: Optionally, remove the refreshToken from the database
          const user = await User.findByIdAndUpdate(
               req.user._id, // Assuming req.user contains the logged-in user's details
               { $set: { refreshToken: "" } }, // Set refreshToken to empty
               { new: true } // Return the updated document
          );
          // Step 3: Send a success response
          res.status(200).json(
               new ApiResponse(200,{},"user logged out successfully")
          );
     } catch (error) {
          throw new ApiError(501,"Error in logging out");
     }
});

/**
 * refreshes the access token
 */
const refreshAccessToken = AsyncHandler(async(req,res)=>{
try {
           //step 1: check refresh token existence in cookies
           const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
           if(!refreshToken){
               throw new ApiError(400,"Refresh token not found!");
           }
     
          //step 2: verify the refresh token
          const decodedToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
         
          if(!decodedToken){
               throw new ApiError(401,"Invalid refresh token");
          }
          //step 3: find user by decoded token
          const user = await User.findById(decodedToken._id);

          if(!user){
               throw new ApiError(401,"Invalid refresh token");
          }
          //step 4: generate new access token and refresh token
          const tokens= await generateAcessTokenAndRefreshToken(user);
     
          //step 5: send new access token and refresh token in response
          res
          .status(200)
          .cookie("accessToken",tokens.accessToken,COOKIE_OPTION)
          .cookie("refreshToken",tokens.refreshToken,COOKIE_OPTION)
          .json(
               new ApiResponse(200,{},"access token refreshed")
          );
     
} catch (error) {
     throw new ApiError(500,error?.message || "Error refreshing access token");
}

});

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
     register,
     loginUser,
     logoutUser,
     refreshAccessToken,
     changeCurrentPassword,
     updateAvatar,
     updateCoverImage,
     getCurrentUser,
     updateUserDetails
};