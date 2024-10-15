const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]; // Extract token
    try {
      if (token) {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user based on decoded token id
        const user = await User.findById(decoded?.id);
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        // Attach the user object to the request
        req.user = user;
        next();
      }
    } catch (error) {
      // If the token is invalid or expired
      return res
        .status(401)
        .json({ message: "Not Authorized, token expired or invalid" });
    }
  } else {
    // If no token is provided
    return res.status(401).json({ message: "No token attached to header" });
  }
});
module.exports = { authMiddleware };
