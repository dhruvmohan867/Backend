import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv';
dotenv.config();

console.log("Cloudinary env:", {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY ? '***present***' : undefined,
  secret: process.env.CLOUDINARY_API_SECRET ? '***present***' : undefined
});

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    console.log("Uploading local file:", localFilePath);
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    const url = response.secure_url || response.url;
    console.log("File uploaded to Cloudinary:", url);
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return { ...response, url };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (localFilePath && fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (e) {
        console.error("unlink failed", e);
      }
    }
    return null;
  }
}; // <-- this was missing

const uploadOnCloudinary = uploadCloudinary;

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log("Cloudinary delete result:", result);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};

export { uploadCloudinary, uploadOnCloudinary, deleteFromCloudinary }