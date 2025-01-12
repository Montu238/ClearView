import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/index.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


const register= AsyncHandler(async(req,res)=>{
     //step 1: fields validations
     const {userName,email,fullName,password} = req.body;
     if([userName,email,fullName,password].some((element)=>element?.trim()==="")){
       throw new ApiError(400,"All fields are required !");
      }
      //step 2: check if user already exists :username ,email
       const existingUser = await User.findOne({
            $or:[{userName},{email}]
       });
       if(existingUser){
             throw new ApiError(409,"User already exists !\n");
             console.log(user);
       }
      //step 3:check for files
      console.log("Request file Object :",req.files);
      const avatarLocalPath = req.files?.avatar[0]?.path;
      const coverImageLocalPath = req.files?.coverImage[0]?.path;
       if(!avatarLocalPath){
            throw new ApiError(400,"avatar is required");
       }
     //step 4: check files are successfully uploaded on cloudinary :avatar,coverImage
     const avatar = await uploadOnCloudinary(avatarLocalPath);
     let coverImage;
     if (coverImageLocalPath) {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
     }
      if(!avatar){
            throw new ApiError(500,"failed to upload on cloudinary")
      }

     //step 5:create user object and add in DB
    const user = await User.create({
            userName:userName.toLowerCase(),
            email,
            fullName,
            password,
            avatar:avatar.url,
            coverImage:coverImage?.url || ""
      });
     //step 7:check for user creation
     const createdUser= await User.findById(user._id).select(
      "-password -refreshToken -watchHistory"
     );
     if(!createdUser){
      throw new ApiError(500,"something went wrong while registering user");
     }

     //step 8:send response to client 
     res.status(201).json(
      new ApiResponse(201,createdUser," user registered successfully")
     );
});



export {register};