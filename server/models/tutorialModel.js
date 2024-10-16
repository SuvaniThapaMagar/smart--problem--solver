const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
const tutorialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [String],
  keywords: [String],  // New field for keywords for NLP matching
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to automatically generate keywords before saving
tutorialSchema.pre('save', function (next) {
  // Simple keyword extraction logic (can be enhanced)
  this.keywords = this.title.split(" ").concat(this.content.split(" ")).map(word => word.toLowerCase().trim());
  next();
});

// Export the model
module.exports = mongoose.model("Tutorial", tutorialSchema);
