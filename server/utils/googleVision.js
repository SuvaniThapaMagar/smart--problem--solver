const axios = require('axios');
require('dotenv').config();

// Function to call Google Cloud Vision API
const analyzeImage = async (imageUrl) => {
  try {
    const visionApiKey = process.env.GOOGLE_CLOUD_API_KEY;
    
    if (!visionApiKey) {
      throw new Error('Google Cloud Vision API key is not set in environment variables.');
    }

    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`;

    // Sending request to Google Vision API
    const visionResponse = await axios.post(visionApiUrl, {
      requests: [
        {
          image: {
            source: { imageUri: imageUrl }
          },
          features: [{ type: "LABEL_DETECTION", maxResults: 5 }]
        }
      ]
    });

    // Extract labels from the API response
    const labels = visionResponse.data.responses[0].labelAnnotations.map(label => ({
      description: label.description,
      score: label.score,
    }));

    return labels;

  } catch (error) {
    console.error("Error in Google Vision API:", error);
    if (error.response) {
      console.error("Google Vision API response:", error.response.data);
    }
    throw new Error("Error in Google Vision API");
  }
};

module.exports = {
  analyzeImage,
};
