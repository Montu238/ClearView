import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const extractPublicIdFromUrl = (publicUrl) => {
  let publicId = publicUrl.split("/").pop().split(".").shift();
  return publicId;
};


const uploadOnImageCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Validating file path
    if (!fs.existsSync(localFilePath)) {
      console.log("File does not exist at the specified path.");
      return null;
    }

    // Uploading file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // or specify "image", "video", etc.
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("Error uploading file:", error.message);
    // Delete local file if upload fails
    try {
      fs.unlinkSync(localFilePath);
    } catch (err) {
      console.log("Error deleting local file:", err.message);
    }

    return null;
  }
};

const deleteImageOnCloudinary = async (publicUrl) => {
  try {
    const publicId = extractPublicIdFromUrl(publicUrl);

    // Check if publicId is valid before making the request
    if (!publicId) {
      console.log("Invalid public URL or public ID extraction failed.");
      throw new Error("failed to delete video");
    }

     await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

  } catch (error) {
    console.log("Error deleting image:", error.message);
    
  }
};

const uploadVideoOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Validating file path
    if (!fs.existsSync(localFilePath)) {
      console.log("File does not exist at the specified path.");
      return null;
    }

    // Uploading file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      asset_folder: "clearview_videos",
      resource_type: "video",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("Error uploading file:", error.message);
    // Delete local file if upload fails
    try {
      fs.unlinkSync(localFilePath);
    } catch (err) {
      console.log("Error deleting local file:", err.message);
    }

    return null;
  }
};

const deleteVideoOnCloudinary = async (publicUrl) => {
  try {
    const publicId = extractPublicIdFromUrl(publicUrl);

    // Check if publicId is valid before making the request
    if (!publicId) {
      console.log("Invalid video URL or public ID extraction failed.");
      throw new Error("failed to delete video");
    }

    await cloudinary.uploader.destroy(publicId,{
      resource_type: "video",
    });

  } catch (error) {
    console.log("Error deleting video:", error.message);
  }
};

export {
  uploadOnImageCloudinary,
  deleteImageOnCloudinary,
  uploadVideoOnCloudinary,
  deleteVideoOnCloudinary,
};
