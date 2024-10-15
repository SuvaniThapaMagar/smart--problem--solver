const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var tutorialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [String],

  createdAt: { type: Date,
     default: Date.now 
    },

  updatedAt: { type: Date, 
    default: Date.now },
});

//Export the model
module.exports = mongoose.model("Tutorial", tutorialSchema);
