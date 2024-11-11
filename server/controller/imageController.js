const path = require("path");
const fs = require("fs");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMgdbId");
const cloudinaryUploadImg = require("../utils/cloudinary");
const Image = require("../models/imageModel");
const { analyzeImage } = require("../utils/googleVision");
const { scrapeTutorials } = require("../utils/webScraper");
const { findRelevantTutorial } = require("../config/nlp");
require("dotenv").config();

const uploadImages = asyncHandler(async (req, res) => {
  console.log("Request Body:", req.body);
  console.log("Request Files:", req.files);

  const { userId, description } = req.body;
  console.log("Received userId:", userId);
  console.log("Received description:", description);

  // Input validation
  if (!userId || userId === "null") {
    return res.status(400).json({ message: "Valid userId is required" });
  }

  if (!description) {
    return res.status(400).json({ message: "Image description is required" });
  }

  try {
    validateMongoDbId(userId);
  } catch (error) {
    console.error("Invalid userId:", error);
    return res.status(400).json({ message: "Invalid userId format" });
  }

  try {
    // Cloudinary upload function
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

    const processedResults = [];

    for (const file of files) {
      const filePath = file.path;
      console.log("Processing file:", filePath);

      try {
        // Upload to Cloudinary
        const result = await uploader(filePath);
        const imageUrl = result.url;
        console.log("Cloudinary URL:", imageUrl);

        // Analyze with Google Vision
        const labels = await analyzeImage(imageUrl);
        console.log("Extracted labels:", labels);

        // Clean up local file
        fs.unlinkSync(filePath);
        console.log("Cleaned up file:", filePath);

        // Save image to database
        const savedImage = await Image.create({
          user: userId,
          imageUrl: imageUrl,
          description: description,
          labels: labels,
          status: "processed",
        });
        console.log("Saved image to database:", savedImage);

        // Process labels and search for tutorials
        let tutorials = {
          youtubeVideo: { title: '', link: '' },
          googleLinks: []
        };

        try {
          // Create search query using description and top labels
          const searchQuery = description + " " + 
            labels.slice(0, 3).map(label => label.description).join(" ") + 
            " tutorial";
          console.log("Search query:", searchQuery);

          // Get tutorials with retry mechanism
          tutorials = await scrapeTutorials(searchQuery);
          console.log("Scraped Tutorials:", tutorials);
        } catch (tutorialError) {
          console.error("Error scraping tutorials:", tutorialError);
          // Continue with empty tutorials object rather than failing
        }

        // Add processed result to array
        processedResults.push({
          image: savedImage,
          tutorials: tutorials
        });

      } catch (error) {
        console.error("Error processing image:", error);
        // Clean up file if it exists
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw error;
      }
    }

    // Send response
    res.status(200).json(processedResults);
    console.log("Sending response to frontend:", processedResults);

  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

module.exports = {
  uploadImages,
};