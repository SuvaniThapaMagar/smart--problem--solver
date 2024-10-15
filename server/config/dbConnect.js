const mongoose = require('mongoose');
require('dotenv').config();

function dbConnect() {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log("Database is connected");
  } catch (e) {
    console.error("Error connecting database", e);
  }
}

module.exports = dbConnect;
