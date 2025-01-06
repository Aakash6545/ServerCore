import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv"
dotenv.config({
  path: "../../.env"
})

console.log(process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOnCloudinary(localFilePath) {
  let uploadResult = null;
  try {
    uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
  } catch (error) {
    console.log(error);
  } finally {
    try {
      fs.unlinkSync(localFilePath);
      console.log("Local file deleted successfully.");
    } catch (deleteError) {
      console.error("Error deleting local file:", deleteError);
    }
  }
  console.log(uploadResult);

  return uploadResult;
}
uploadOnCloudinary("../../public/p-photo-new.jpg")
export { uploadOnCloudinary };
