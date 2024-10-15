const express = require('express');
const { uploadImages } = require('../controller/imageController'); // Import the uploadImages function
const { uploadPhoto } = require('../middlewares/uploadimages'); // Assuming you're using a middleware for image uploads

const router = express.Router();

// Route for uploading images
router.post('/upload', uploadPhoto.array('images', 10), uploadImages); // Correctly use the uploadImages as a callback function

module.exports = router;
