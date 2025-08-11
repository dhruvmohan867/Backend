import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv';
dotenv.config();

console.log("Cloudinary env:", {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET
});

  cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

const uploadCloudinary = async(localFilePath)=>{
   try{
     if (!localFilePath){
      return null;
    }
     console.log
     const response = await cloudinary.uploader.upload(localFilePath,{
         resource_type : "auto"
     })
     console.log("File upload ho gyi hai")
     console.log(response.url)
      fs.unlinkSync(localFilePath) // Delete the local file after upload
     return response;
   }
  catch(error){
   console.error("Cloudinary upload error:", error);
   fs.unlinkSync(localFilePath)
   return null
}
}
export {uploadCloudinary}