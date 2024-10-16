const path = require("path");
const fs = require("fs");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMgdbId");
const cloudinaryUploadImg = require("../utils/cloudinary");
const Image = require("../models/imageModel");
const { analyzeImage } = require("../utils/googleVision");
const { scrapeTutorials } = require("../utils/webScraper");  // Web scraping function
const { findRelevantTutorial } = require("../config/nlp");  // NLP matching function
require('dotenv').config();

const uploadImages = asyncHandler(async (req, res) => {
  console.log("Request Body:", req.body);
  console.log("Request Files:", req.files);

  const { userId } = req.body;
  console.log("Received userId:", userId);

  if (!userId || userId === 'null') {
    return res.status(400).json({ message: "Valid userId is required" });
  }

  try {
    validateMongoDbId(userId);
  } catch (error) {
    console.error("Invalid userId:", error);
    return res.status(400).json({ message: "Invalid userId format" });
  }

  try {
    const uploader = async (filePath) => {
      console.log("Attempting to upload to Cloudinary:", filePath);
      try {
        const result = await cloudinaryUploadImg(filePath);
        console.log("Cloudinary upload result:", result);
        return result;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
      }
    };

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedImages = [];

    for (const file of files) {
      const filePath = file.path;
      console.log("Processing file:", filePath);

      try {
        // Upload image to Cloudinary
        const result = await uploader(filePath);
        const imageUrl = result.url;

        console.log("Cloudinary URL:", imageUrl);

        // Analyze image using Google Vision API
        const labels = await analyzeImage(imageUrl);
        console.log("Extracted labels:", labels);

        // Clean up the local file after processing
        fs.unlinkSync(filePath);
        console.log("Cleaned up file:", filePath);

        // Save the image with labels to the database
        const newImage = await Image.create({
          user: userId,
          imageUrl: imageUrl,
          labels: labels,
          status: 'processed',
        });
        console.log("Saved image to database:", newImage);

        // Convert labels into a search query using NLP
        const searchQuery = findRelevantTutorial(labels);  // Process the image labels with NLP
        console.log("NLP search query:", searchQuery);

        // Scrape tutorials based on the NLP-processed search query
        const tutorials = await scrapeTutorials(searchQuery);
        console.log("Scraped Tutorials:", tutorials);

        // Push image and tutorial data to the response array
        uploadedImages.push({
          image: newImage,
          tutorials,  // Attach relevant tutorials (scraped)
        });

      } catch (error) {
        console.error("Error processing image:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
        }
        return res.status(500).json({ message: "Error uploading or processing image", error: error.message });
      }
    }

    // Send back the processed images and matched tutorials
    res.json({
      message: "Images uploaded and analyzed successfully",
      images: uploadedImages,
    });
    console.log("Sending response to frontend:", uploadedImages);

  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
  uploadImages,
};
