import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/index.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


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

const loginUser = AsyncHandler(async (req, res) => {
     //step 1:take credentials from request
     const { userName, email, password } = req.body;

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
          .cookie("accessToken", accessToken)
          .cookie("refreshToken", refreshToken)
          .json(
               new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, "Login successfull")
          )

});

const logoutUser = AsyncHandler(async (req, res) => {
     // Step 1: Clear cookies (accessToken and refreshToken)
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
});

export { register, loginUser, logoutUser };