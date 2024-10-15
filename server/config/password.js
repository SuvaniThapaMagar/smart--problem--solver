const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log("Google strategy callback", profile);
    const { id, emails, displayName } = profile;
    try {
      let user = await User.findOne({ googleId: id });
      if (!user) {
        console.log("Creating new user");
        user = await User.create({
          googleId: id,
          email: emails[0].value,
          displayName,
        });
      } else {
        console.log("Existing user found");
      }
      done(null, user);
    } catch (error) {
      console.error("Error in Google strategy:", error);
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user:", id);
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(error, null);
  }
});

// Make sure to export passport
module.exports = passport;