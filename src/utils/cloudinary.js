import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
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

    console.log("File uploaded successfully on Cloudinary:", response.url);
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

export { uploadOnCloudinary };
