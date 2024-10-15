const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Ensure you have bcrypt imported

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        // Only require password if user is not using Google login
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple entries with the same email but different googleId
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model
module.exports = mongoose.model("User", userSchema);
