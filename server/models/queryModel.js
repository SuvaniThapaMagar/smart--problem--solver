const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var querySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: true },
    tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
  })
//Export the model
module.exports = mongoose.model('Query', querySchema);