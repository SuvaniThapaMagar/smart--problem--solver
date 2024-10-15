const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String, // URL to the image in Cloudinary or other storage
      required: true,
    },
    labels: [
      {
        description: String,
        score: Number,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["uploaded", "processing", "processed", "failed"],
      default: "uploaded",
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);
