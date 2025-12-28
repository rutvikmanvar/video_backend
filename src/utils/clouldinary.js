import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// REMOVE cloudinary.config FROM HERE (Global Scope)

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // ✅ MOVE CONFIG HERE (Inside the function)
        // This guarantees process.env is ready before we use it
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET 
        });

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(`cloudinary response : `,response)
        // console.log("File is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.log("Cloudinary Upload Error:", error); // Keep this for debugging
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadOnCloudinary }