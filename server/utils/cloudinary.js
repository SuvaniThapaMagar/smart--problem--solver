const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY,
});

const cloudinaryUploadImg = async (fileToUploads) => {
  try {
    const result = await cloudinary.uploader.upload(fileToUploads, {
      resource_type: "image",
      format: "jpeg", // Explicitly specify the format if needed
    });
    return {
      url: result.secure_url,
      asset_id: result.asset_id,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed. Full error object:", error); // Detailed error logging
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};


module.exports = cloudinaryUploadImg;
