const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require('jsonwebtoken'); // Add this line

// Google login route

router.get("/google", (req, res, next) => {
  console.log("Initiating Google OAuth flow");
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })(req, res, next);
});


// Google OAuth callback route

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("Google OAuth callback reached", req.user);
    if (!req.user) {
      console.log("No user found in request");
      return res.redirect("http://localhost:5173/login?error=auth_failed");
    }
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("JWT generated:", token);
    res.redirect(`http://localhost:5173/login?token=${token}`);
  }
);


// Route to check if user is authenticated
router.get("/check", (req, res) => {
  console.log("Auth check requested", req.isAuthenticated());
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect("http://localhost:5173"); // Redirect to your frontend login page
  });
});

module.exports = router;