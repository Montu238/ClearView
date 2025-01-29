import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const extractPublicIdFromImageUrl = (publicUrl) => {
  const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
  const match = publicUrl.match(regex);
  return match ? match[1] : null;
};

const extractPublicIdFromVideoUrl = (videoUrl) => {
  const regex = /\/(?:clearview_videos\/)([^\/?]+)/; // Matches the ID after '/clearview_videos/'
  const match = videoUrl.match(regex);
  return match ? `clearview_videos/${match[1]}` : null; // Prefix the ID with 'clearview_videos/'
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
    const publicId = extractPublicIdFromImageUrl(publicUrl);
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image", // or specify "image", "video", etc.
    });
    if (response?.result == "ok") {
      return true;
    }
    return false;
  } catch (error) {
    console.log("Error deleting file:", error.message);
    return false;
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
    const publicId = extractPublicIdFromVideoUrl(publicUrl);
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
    if (response?.result == "ok") {
      return true;
    }
    return false;
  } catch (error) {
    console.log("Error deleting file:", error.message);
    return false;
  }
};
export {
  uploadOnImageCloudinary,
  deleteImageOnCloudinary,
  uploadVideoOnCloudinary,
  deleteVideoOnCloudinary,
};
